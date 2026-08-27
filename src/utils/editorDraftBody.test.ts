import { resolveDraftSaveBody } from './editorDraftBody';

describe('resolveDraftSaveBody', () => {
  it('uses the recorded body while its update is still in flight', () => {
    // the unmount path: the drain committed a resolved image url, but setState
    // has not landed, so state still holds the "Uploading..." placeholder
    expect(
      resolveDraftSaveBody('before ![](Uploading... a.jpg)', 'before ![](https://x/a.png)', true),
    ).toBe('before ![](https://x/a.png)');
  });

  it('uses state once the recorded update has landed', () => {
    expect(resolveDraftSaveBody('committed', 'committed', false)).toBe('committed');
  });

  it('does not resurrect a cleared body from a settled recorded value', () => {
    // Clear empties fields.body without going through _handleFormUpdate; the
    // previously recorded body has already landed, so it must not win here
    expect(resolveDraftSaveBody('', 'text the user cleared', false)).toBe('');
  });

  it('does not override a draft that arrived after the recorded update landed', () => {
    expect(resolveDraftSaveBody('body from the loaded draft', 'earlier typing', false)).toBe(
      'body from the loaded draft',
    );
  });

  it('falls back to state when nothing was ever recorded', () => {
    expect(resolveDraftSaveBody('only state', undefined, false)).toBe('only state');
    expect(resolveDraftSaveBody('only state', undefined, true)).toBe('only state');
  });

  it('honours a recorded empty body that has not landed yet', () => {
    // clearing the editor is a real body update: an empty string is a value here,
    // not a missing one
    expect(resolveDraftSaveBody('stale text', '', true)).toBe('');
  });
});
