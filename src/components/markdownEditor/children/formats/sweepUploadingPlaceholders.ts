import { uploadPlaceholderPattern } from './applyMediaLink';

/**
 * Strip orphaned `![...](Uploading... filename)` placeholders from a body that is
 * being loaded into the editor. At load time no upload can still be in flight for
 * this body, so any placeholder left in it is dead: its upload either failed
 * silently or finished after the editor had closed (the file is in the uploads
 * gallery either way). Left alone it renders as a broken image stuck on
 * "Uploading..." forever.
 *
 * One newline adjacent to each removed placeholder is absorbed (the insert wrote
 * `\n![](...)\n`), so the removal doesn't leave a blank line behind.
 *
 * `caret` is a saved caret position for the same body; it is shifted by the
 * removals before it so the user still resumes at the text they were editing.
 * Kept dependency-free so it can be unit-tested without the editor module graph.
 */
export const sweepUploadingPlaceholders = (
  text: string,
  caret?: number,
): { text: string; caret?: number } => {
  if (!text || !text.includes('(Uploading...')) {
    return { text, caret };
  }

  const removals: Array<{ start: number; end: number }> = [];
  const pattern = uploadPlaceholderPattern();
  let match = pattern.exec(text);
  while (match !== null) {
    let start = match.index;
    let end = start + match[0].length;
    if (text[end] === '\n') {
      end += 1;
    } else if (start > 0 && text[start - 1] === '\n') {
      start -= 1;
    }
    const prev = removals[removals.length - 1];
    if (prev && start < prev.end) {
      // the absorbed leading newline was already consumed by the previous removal
      start = match.index;
    }
    removals.push({ start, end });
    match = pattern.exec(text);
  }

  if (removals.length === 0) {
    return { text, caret };
  }

  let swept = '';
  let cursor = 0;
  removals.forEach(({ start, end }) => {
    swept += text.slice(cursor, start);
    cursor = end;
  });
  swept += text.slice(cursor);

  let newCaret = caret;
  if (typeof caret === 'number') {
    let shift = 0;
    removals.forEach(({ start, end }) => {
      if (caret >= end) {
        shift += end - start;
      } else if (caret > start) {
        // caret sat inside the removed span: land it where the span began
        shift += caret - start;
      }
    });
    newCaret = caret - shift;
  }

  return { text: swept, caret: newCaret };
};
