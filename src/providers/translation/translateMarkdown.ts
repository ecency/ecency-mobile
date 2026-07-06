import { chunkText, getTranslation } from './translation';

// Markdown-aware translation for the compose-side feature: only prose is sent
// to LibreTranslate; code fences, images, tables, raw HTML, bare URLs and
// horizontal rules pass through untouched, and heading/quote/list markers are
// stripped before and re-attached after translation. Batches stay below the
// long-text chunk limit since blocks are joined with blank lines.
const MAX_BLOCK_BATCH_CHARS = 1500;

const FENCE_LINE = /^\s*(`{3,}|~{3,})/;
const IMAGE_ONLY_LINE = /^\s*!\[[^\]]*\]\([^)]*\)\s*$/;
const HORIZONTAL_RULE_LINE = /^\s*([-*_][^\S\n]*){3,}$/;
const URL_ONLY_LINE = /^\s*https?:\/\/\S+\s*$/;
const TABLE_SEPARATOR_LINE = /^\s*[|:\s-]+\s*$/;
// Leading line markers that must survive translation: headings, quotes and
// list items, possibly nested ("  - ", "> > ").
const LINE_MARKER_PREFIX = /^(\s*(?:(?:#{1,6}|>|[-*+]|\d+\.)\s+)+)/;

/**
 * Split markdown into blocks on blank lines, keeping fenced code regions
 * together even when they contain blank lines. A fence directly under text
 * (no separating blank line) still starts its own block so the surrounding
 * prose can be translated without dragging the code along.
 */
const splitMarkdownBlocks = (markdown: string): string[] => {
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: string | null = null;

  const flush = () => {
    if (current.length > 0) {
      blocks.push(current.join('\n'));
      current = [];
    }
  };

  markdown.split('\n').forEach((line) => {
    const fenceMatch = line.match(FENCE_LINE);
    if (fence) {
      current.push(line);
      if (fenceMatch && fenceMatch[1][0] === fence[0] && fenceMatch[1].length >= fence.length) {
        fence = null;
        flush();
      }
    } else if (fenceMatch) {
      flush();
      // eslint-disable-next-line prefer-destructuring
      fence = fenceMatch[1];
      current.push(line);
    } else if (!line.trim()) {
      flush();
    } else {
      current.push(line);
    }
  });
  flush();
  return blocks;
};

const isSkippableBlock = (block: string): boolean => {
  if (FENCE_LINE.test(block) || /^\s*</.test(block)) {
    return true;
  }
  const lines = block.split('\n');
  if (
    lines.every((line) => HORIZONTAL_RULE_LINE.test(line)) ||
    lines.every((line) => IMAGE_ONLY_LINE.test(line)) ||
    lines.every((line) => URL_ONLY_LINE.test(line))
  ) {
    return true;
  }
  // Tables: a pipe row plus a |---| separator row. Cell-safe translation is
  // out of scope, so the whole block is passed through.
  return (
    lines.some((line) => line.includes('|')) &&
    lines.some(
      (line) => line.includes('|') && line.includes('-') && TABLE_SEPARATOR_LINE.test(line),
    )
  );
};

interface TranslateRequest {
  text: string;
  apply: (translated: string) => void;
}

/**
 * Translate a markdown document while preserving its structure. Consecutive
 * plain paragraphs are batched into one request (whole blocks only, never
 * across skipped blocks); marker lines are translated line-wise with their
 * prefix re-attached. Requests run sequentially and any failure rejects the
 * whole call, so callers never apply a partially translated document.
 */
export const translateMarkdown = async (
  markdown: string,
  source: string,
  target: string,
  onProgress?: (done: number, total: number) => void,
  isCancelled?: () => boolean,
): Promise<string> => {
  const normalized = markdown.replace(/\r\n?/g, '\n');
  if (!normalized.trim()) {
    return normalized;
  }

  const blocks = splitMarkdownBlocks(normalized);
  const output: (string | null)[] = [...blocks];
  const requests: TranslateRequest[] = [];

  let batchIndices: number[] = [];
  let batchSize = 0;
  const flushBatch = () => {
    if (batchIndices.length === 0) {
      return;
    }
    const indices = batchIndices;
    requests.push({
      text: indices.map((i) => blocks[i]).join('\n\n'),
      apply: (translated) => {
        output[indices[0]] = translated;
        indices.slice(1).forEach((i) => {
          output[i] = null;
        });
      },
    });
    batchIndices = [];
    batchSize = 0;
  };

  blocks.forEach((block, index) => {
    if (isSkippableBlock(block)) {
      flushBatch();
      return;
    }

    const lines = block.split('\n');
    if (lines.some((line) => LINE_MARKER_PREFIX.test(line))) {
      flushBatch();
      const translatedLines = [...lines];
      lines.forEach((line, lineIndex) => {
        const marker = line.match(LINE_MARKER_PREFIX);
        // Marker-less continuation lines keep their leading indentation,
        // which translation would otherwise strip.
        const prefix = marker ? marker[1] : line.match(/^\s*/)?.[0] ?? '';
        const rest = line.slice(prefix.length);
        if (!rest.trim() || IMAGE_ONLY_LINE.test(rest) || URL_ONLY_LINE.test(rest)) {
          return;
        }
        const chunks =
          rest.length > MAX_BLOCK_BATCH_CHARS ? chunkText(rest, MAX_BLOCK_BATCH_CHARS) : [rest];
        const parts: string[] = new Array(chunks.length).fill('');
        chunks.forEach((chunk, chunkIndex) => {
          requests.push({
            text: chunk,
            apply: (translated) => {
              parts[chunkIndex] = translated;
              translatedLines[lineIndex] = `${prefix}${parts.join(' ')}`;
              output[index] = translatedLines.join('\n');
            },
          });
        });
      });
      return;
    }

    if (block.length > MAX_BLOCK_BATCH_CHARS) {
      flushBatch();
      const chunks = chunkText(block, MAX_BLOCK_BATCH_CHARS);
      const parts: string[] = new Array(chunks.length).fill('');
      chunks.forEach((chunk, chunkIndex) => {
        requests.push({
          text: chunk,
          apply: (translated) => {
            parts[chunkIndex] = translated;
            output[index] = parts.join(' ');
          },
        });
      });
      return;
    }

    if (batchIndices.length > 0 && batchSize + 2 + block.length > MAX_BLOCK_BATCH_CHARS) {
      flushBatch();
    }
    batchSize += (batchIndices.length > 0 ? 2 : 0) + block.length;
    batchIndices.push(index);
  });
  flushBatch();

  if (requests.length === 0) {
    return blocks.join('\n\n');
  }

  onProgress?.(0, requests.length);
  let done = 0;
  // Sequential on purpose: gentle on the shared LibreTranslate instance and
  // keeps the progress counter meaningful.
  // eslint-disable-next-line no-restricted-syntax
  for (const request of requests) {
    if (isCancelled?.()) {
      throw new Error('translate-cancelled');
    }
    // eslint-disable-next-line no-await-in-loop
    const { translatedText } = await getTranslation(request.text, source, target);
    request.apply(translatedText);
    done += 1;
    onProgress?.(done, requests.length);
  }

  return output.filter((block): block is string => block !== null).join('\n\n');
};
