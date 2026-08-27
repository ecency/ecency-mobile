/**
 * The `![alt](Uploading... filename)` placeholder the editor writes while an upload
 * is in flight, and the tools for finding one again afterwards.
 *
 * Lives here rather than in the editor so both sides of the upload flow can use it
 * without importing each other, and stays dependency-free so it can be unit-tested
 * without either module graph.
 */
export const uploadPlaceholderPrefix = 'Uploading... ';

// Matches the literal prefix INCLUDING its trailing space, so only text this editor
// actually wrote can be repaired or swept; `![](Uploading...x.jpg)` is someone's own
// markdown and must be left alone (the sweep deletes what it matches).
//
// The filename part allows one level of balanced parentheses, because gallery
// filenames routinely contain them (`IMG_2024 (1).jpg`); stopping at the first `)`
// matched only a prefix and left `.jpg)` behind as garbage. Alt text and filename
// both exclude newlines so a match can never swallow surrounding body text, and the
// alternation cannot run past the placeholder's own closing paren.
export const uploadPlaceholderPattern = () =>
  /!\[[^\]\n]*\]\(Uploading\.\.\. (?:[^()\n]|\([^()\n]*\))*\)/g;

/**
 * Filenames of the upload placeholders currently in `text`.
 *
 * Lets a freshly mounted gallery recover which uploads still own a placeholder in
 * the body — the preview toggle unmounts it while uploads keep running, and its
 * in-flight set would otherwise start empty and under-report those rivals.
 */
export const extractUploadPlaceholderNames = (text?: string): string[] => {
  if (!text || !text.includes(`(${uploadPlaceholderPrefix.trimEnd()}`)) {
    return [];
  }

  const names: string[] = [];
  const pattern = uploadPlaceholderPattern();
  let match = pattern.exec(text);
  while (match !== null) {
    const open = match[0].indexOf('](') + 2;
    const name = match[0].slice(open, -1).slice(uploadPlaceholderPrefix.length);
    if (name) {
      names.push(name);
    }
    match = pattern.exec(text);
  }
  return names;
};
