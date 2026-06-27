import editorReducer from './editorReducer';
import { setDraftCaret, removeEditorCache, setPollDraftAction } from '../actions/editorActions';

describe('editorReducer - caretMap', () => {
  it('defaults caretMap to an empty object', () => {
    const state = editorReducer(undefined, { type: '@@INIT' } as any);
    expect(state.caretMap).toEqual({});
  });

  it('stores a caret offset keyed by draftId', () => {
    const state = editorReducer(undefined, setDraftCaret('draft-1', 42));
    expect(state.caretMap['draft-1']).toBe(42);
  });

  it('replaces the caret offset on a subsequent dispatch for the same draft', () => {
    let state = editorReducer(undefined, setDraftCaret('draft-1', 42));
    state = editorReducer(state, setDraftCaret('draft-1', 100));
    expect(state.caretMap['draft-1']).toBe(100);
  });

  it('keeps caret offsets isolated per draft', () => {
    let state = editorReducer(undefined, setDraftCaret('draft-1', 10));
    state = editorReducer(state, setDraftCaret('draft-2', 20));
    expect(state.caretMap).toEqual({ 'draft-1': 10, 'draft-2': 20 });
  });

  it('preserves a caret offset of 0 (resume at top, not "no value")', () => {
    const state = editorReducer(undefined, setDraftCaret('draft-1', 0));
    expect(state.caretMap['draft-1']).toBe(0);
  });

  it('clears the caret offset when the editor cache for that draft is removed', () => {
    let state = editorReducer(undefined, setDraftCaret('draft-1', 42));
    state = editorReducer(state, setDraftCaret('draft-2', 7));
    state = editorReducer(state, removeEditorCache('draft-1'));
    expect(state.caretMap['draft-1']).toBeUndefined();
    expect(state.caretMap['draft-2']).toBe(7);
  });

  it('does not disturb other editor maps when setting a caret', () => {
    let state = editorReducer(undefined, setPollDraftAction('draft-1', { title: 'q' } as any));
    state = editorReducer(state, setDraftCaret('draft-1', 5));
    expect(state.caretMap['draft-1']).toBe(5);
    expect(state.pollDraftsMap['draft-1']).toEqual({ title: 'q' });
  });
});
