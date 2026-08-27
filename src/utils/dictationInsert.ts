/**
 * Where a dictated segment goes in the quick post composer's body.
 *
 * That composer tracks no caret (its input sets no `selection` and no
 * `onSelectionChange`), so unlike the markdown editor there is no insertion point to
 * honour and the end of the body is the only position that is always right.
 *
 * The separator is the whole reason this is not a bare concatenation. The dictation
 * sheet stays open and fires once per recorded segment, so segments arrive
 * back-to-back and would otherwise run together into one word. It must not add a
 * leading space to an empty body, and must not double a space the user already
 * typed, or a body dictated in several passes ends up peppered with them.
 *
 * Returns the body unchanged for a blank transcript: a silent clip still costs
 * Points, and the sheet reports that itself rather than quietly appending nothing.
 *
 * Kept dependency-free so it can be unit-tested without the composer's module graph.
 */
export const appendDictatedText = (body: string, text: string): string => {
  const dictated = text.trim();
  if (!dictated) {
    return body;
  }
  const separator = body.length === 0 || /\s$/.test(body) ? '' : ' ';
  return `${body}${separator}${dictated}`;
};
