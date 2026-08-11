/**
 * Inline markdown for chat messages: bold, italic, strikethrough and inline code.
 *
 * Deliberately a SUBSET. Block constructs (lists, headings, blockquotes) are left alone so a
 * message that happens to start with "-" or "#" keeps reading the way the sender typed it, and
 * so the existing link, mention, emoji and image handling stays on its current code path.
 *
 * The rules below exist to stop ordinary chat text being mangled. The failure that matters is
 * not "some markdown went unformatted", it is "a URL or a variable name got eaten", so every
 * ambiguous case resolves toward leaving the text alone.
 */

export interface InlineSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
}

type Style = Omit<InlineSpan, 'text'>;

const isWordChar = (ch: string | undefined) => !!ch && /[A-Za-z0-9]/.test(ch);
const isSpace = (ch: string | undefined) => !ch || /\s/.test(ch);

interface Rule {
  open: string;
  close: string;
  style: Style;
  /** Underscore emphasis must not fire inside a word, so snake_case_names stay intact. */
  wordBoundary?: boolean;
  /** Code spans are literal: nothing inside them is parsed further. */
  literal?: boolean;
}

// Order matters: longer delimiters first, so ** is not read as two separate * emphases.
const RULES: Rule[] = [
  { open: '`', close: '`', style: { code: true }, literal: true },
  { open: '**', close: '**', style: { bold: true } },
  { open: '__', close: '__', style: { bold: true }, wordBoundary: true },
  { open: '~~', close: '~~', style: { strike: true } },
  { open: '*', close: '*', style: { italic: true } },
  { open: '_', close: '_', style: { italic: true }, wordBoundary: true },
];

interface DelimiterMatch {
  rule: Rule;
  start: number;
  contentStart: number;
  contentEnd: number;
  end: number;
}

/**
 * Finds the first usable delimiter pair at or after `from`.
 * Returns null when nothing in the remaining text qualifies.
 *
 * The return type is annotated explicitly: `best` is assigned inside a callback, which control
 * flow analysis does not track, so an inferred type collapses to null at the call site.
 */
const findMatch = (text: string, from: number): DelimiterMatch | null => {
  let best: DelimiterMatch | null = null;

  RULES.forEach((rule) => {
    let searchFrom = from;

    while (searchFrom < text.length) {
      const start = text.indexOf(rule.open, searchFrom);
      if (start === -1) {
        return;
      }

      const contentStart = start + rule.open.length;
      // An opening delimiter must be followed by real content, so "2 * 3 * 4" is left alone, and
      // "_" only opens at a word boundary, so file_name_here is not italicised.
      const openInvalid =
        isSpace(text[contentStart]) || (rule.wordBoundary && isWordChar(text[start - 1]));

      if (openInvalid) {
        // Not a real delimiter here. Step past it and keep scanning for THIS rule: "2 * 3 and
        // *italic*" must still find the later pair. Abandoning the rule would miss it.
        searchFrom = start + 1;
      } else {
        let closeAt = text.indexOf(rule.close, contentStart);
        while (closeAt !== -1) {
          const beforeClose = text[closeAt - 1];
          const afterClose = text[closeAt + rule.close.length];
          const closeOk = !isSpace(beforeClose) && !(rule.wordBoundary && isWordChar(afterClose));
          // Content has to be more than delimiters, so a run like "***" stays literal instead of
          // formatting a lone "*". Ambiguous punctuation resolves toward leaving text untouched.
          const hasSubstance = /[^*_~`]/.test(text.slice(contentStart, closeAt));
          if (closeOk && hasSubstance && closeAt > contentStart) {
            break;
          }
          closeAt = text.indexOf(rule.close, closeAt + 1);
        }

        // closeAt === -1 means unterminated: leave it literal rather than swallowing the rest.
        if (closeAt !== -1 && (!best || start < best.start)) {
          best = {
            rule,
            start,
            contentStart,
            contentEnd: closeAt,
            end: closeAt + rule.close.length,
          };
        }
        return;
      }
    }
  });

  return best;
};

const mergeStyle = (a: Style, b: Style): Style => ({ ...a, ...b });

const parse = (text: string, inherited: Style, depth: number): InlineSpan[] => {
  if (!text) {
    return [];
  }

  // Bounded recursion: pathological delimiter soup should degrade to plain text, not hang.
  if (depth > 4) {
    return [{ text, ...inherited }];
  }

  const match = findMatch(text, 0);
  if (!match) {
    return [{ text, ...inherited }];
  }

  const spans: InlineSpan[] = [];
  if (match.start > 0) {
    spans.push({ text: text.slice(0, match.start), ...inherited });
  }

  const content = text.slice(match.contentStart, match.contentEnd);
  const style = mergeStyle(inherited, match.rule.style);

  if (match.rule.literal) {
    spans.push({ text: content, ...style });
  } else {
    spans.push(...parse(content, style, depth + 1));
  }

  spans.push(...parse(text.slice(match.end), inherited, depth));

  return spans.filter((s) => s.text.length > 0);
};

/**
 * Splits `text` into styled spans. Always returns at least one span for non-empty input, and
 * never drops characters: concatenating every `text` yields the input minus the delimiters that
 * were actually consumed.
 */
export const parseInlineMarkdown = (text: string): InlineSpan[] => {
  if (!text) {
    return [];
  }
  return parse(text, {}, 0);
};

/** True when the text contains nothing this module would change. Lets callers skip the work. */
export const hasInlineMarkdown = (text: string): boolean =>
  !!text &&
  /[*_~`]/.test(text) &&
  parseInlineMarkdown(text).some((s) => s.bold || s.italic || s.strike || s.code);
