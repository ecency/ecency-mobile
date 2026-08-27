import {
  MediaInsertContext,
  MediaInsertData,
  MediaInsertStatus,
  Modes,
} from '../../../uploadsGalleryModal/types';
import {
  uploadPlaceholderPattern,
  uploadPlaceholderPrefix,
} from '../../../uploadsGalleryModal/uploadPlaceholder';
import { replaceBetween } from './utils';

interface Selection {
  start: number;
  end: number;
}

interface Args extends MediaInsertContext {
  text: string;
  selection: Selection;
  setTextAndSelection: (args: { selection: Selection; text: string }) => void;
  items: MediaInsertData[];
}

const imagePrefix = '!';

export default async ({ text, selection, setTextAndSelection, items, otherPending }: Args) => {
  let newText = text;
  let newSelection = selection;

  /**
   * Carry the selection across one edit that replaced `[editStart, editEnd)` with
   * `newLength` characters.
   *
   * Both endpoints are mapped INDEPENDENTLY, because a range that begins before
   * the edit and ends after it has to keep covering the same words. Moving the two
   * together (or, when only `start` was tested, moving neither) left the end where
   * the old text put it, so a selection made across a placeholder grew to swallow
   * whatever now sat in the gap — and the next keystroke replaced it.
   *
   * The mapping is monotonic, so `start <= end` still holds afterwards.
   */
  const _mapSelectionThroughEdit = (editStart: number, editEnd: number, newLength: number) => {
    const lengthDiff = newLength - (editEnd - editStart);
    const _mapPosition = (pos: number) => {
      if (pos <= editStart) {
        return pos;
      }
      if (pos >= editEnd) {
        return Math.max(0, pos + lengthDiff);
      }
      // inside the replaced span, whose text is gone: collapse to where it began
      return editStart;
    };

    newSelection = {
      start: _mapPosition(newSelection.start),
      end: _mapPosition(newSelection.end),
    };
  };

  const _insertFormatedString = (altText: any, value: any, mode?: any) => {
    // Video embeds: insert raw URL so the post renderer detects the 3Speak embed
    const formatedText =
      mode === Modes.MODE_VIDEO ? `\n${value}\n` : `\n${imagePrefix}[${altText}](${value})\n`;
    newText = replaceBetween(newText, newSelection, formatedText);
    // Video inserts raw URL (\n{url}\n) so offset is 1; image wraps in ()  so offset is 2
    const cursorOffset = mode === Modes.MODE_VIDEO ? 1 : 2;
    const newIndex =
      newText && newText.indexOf(value, newSelection.start) + value.length + cursorOffset;
    newSelection = {
      start: newIndex,
      end: newIndex,
    };
  };

  const _replaceFormatedString = (placeholder: string, url: string) => {
    const replaceStr = `(${placeholder})`;

    const replaceIndex = newText.indexOf(replaceStr);
    newText = newText.replace(replaceStr, `(${url})`);
    _mapSelectionThroughEdit(replaceIndex, replaceIndex + replaceStr.length, url.length + 2);
  };

  // Every filename that could own a placeholder in this body besides `filename`:
  // other items in this batch (multi-select) plus uploads the gallery reports as
  // still in flight from an earlier batch.
  const _hasRivalUpload = (filename?: string) =>
    items.some((other) => !!other.filename && other.filename !== filename) ||
    (otherPending ?? []).some((name) => name !== filename);

  // The exact placeholder is gone (the user edited it, or a stray keystroke landed
  // inside it). If exactly one upload placeholder remains in the body, and no other
  // upload could own it, it can only be this upload's — so repair it in place. With
  // zero or several candidates, or any rival upload in flight, the target is
  // unknowable: drop the insert rather than writing at the live caret (which lands
  // the image mid-sentence wherever the user happens to be typing) or into another
  // image's slot. The upload itself is safe in the uploads gallery either way.
  const _findLonePlaceholder = (filename?: string) => {
    if (_hasRivalUpload(filename)) {
      return undefined;
    }
    const matches = [...newText.matchAll(uploadPlaceholderPattern())];
    return matches.length === 1 ? matches[0] : undefined;
  };

  const _replaceLonePlaceholder = (match: RegExpMatchArray, url: string) => {
    const parenIndex = match[0].indexOf('](') + 1;
    const start = (match.index as number) + parenIndex;
    const oldLength = match[0].length - parenIndex;
    newText = `${newText.slice(0, start)}(${url})${newText.slice(start + oldLength)}`;
    _mapSelectionThroughEdit(start, start + oldLength, url.length + 2);
  };

  const _removeAt = (index: number, length: number) => {
    let start = index;
    let end = index + length;
    // Absorb one adjacent line break the way the draft sweep does: the insert wrote
    // `\n![](...)\n`, so dropping only the placeholder leaves a blank line behind.
    if (newText[end] === '\n') {
      end += 1;
    } else if (newText[end] === '\r' && newText[end + 1] === '\n') {
      end += 2;
    } else if (start > 0 && newText[start - 1] === '\n') {
      start -= 1;
      if (start > 0 && newText[start - 1] === '\r') {
        start -= 1;
      }
    }

    newText = newText.slice(0, start) + newText.slice(end);
    _mapSelectionThroughEdit(start, end, 0);
  };

  const _removeFormatedString = (placeholder: string, filename?: string) => {
    const formatedText = `${imagePrefix}[](${placeholder})`;
    const formatedTextIndex = newText.indexOf(formatedText);
    if (formatedTextIndex >= 0) {
      _removeAt(formatedTextIndex, formatedText.length);
      return;
    }
    const lone = _findLonePlaceholder(filename);
    if (lone) {
      _removeAt(lone.index as number, lone[0].length);
    }
  };

  items.forEach((item) => {
    const _placeholder = item.filename && `${uploadPlaceholderPrefix}${item.filename}`;

    switch (item.status) {
      case MediaInsertStatus.UPLOADING: // means only filename is available
        if (!_placeholder) return;
        _insertFormatedString(item.text, _placeholder);
        break;

      case MediaInsertStatus.READY: // means url is ready but filename may be available
        if (_placeholder) {
          // guard on the parenthesized form _replaceFormatedString actually swaps:
          // a bare-substring check passes on e.g. `(Uploading... img.jpg2)` whose
          // replace would then silently no-op
          if (newText.includes(`(${_placeholder})`)) {
            _replaceFormatedString(_placeholder, item.url);
          } else if (item.url) {
            const lone = _findLonePlaceholder(item.filename);
            if (lone) {
              _replaceLonePlaceholder(lone, item.url);
            }
            // no recoverable placeholder: the user removed it, or it is beyond
            // repair — deliberately no insert (see _findLonePlaceholder)
          }
        } else if (item.url) {
          // no placeholder was ever written (gallery tap, video embed): a
          // deliberate insert at the caret
          _insertFormatedString(item.text, item.url, item.mode);
        }
        break;

      case MediaInsertStatus.FAILED: // filename available but upload failed
        if (_placeholder) {
          _removeFormatedString(_placeholder, item.filename);
        }
        break;

      default:
        if (item.url) {
          _insertFormatedString(item.text, item.url);
        }
        break;
    }
  });

  // Nothing changed (every item was dropped): skip the write. Rewriting the whole
  // native text is exactly the operation that races with typing, so it is never
  // done gratuitously.
  if (newText === text && newSelection === selection) {
    return;
  }

  // Never hand the native input an out-of-range selection. The shifts above move
  // both endpoints together, so a RANGE selection that straddled an edited
  // placeholder (start before it, end after it) keeps an end that the shortened
  // body no longer has — and on Android setting a selection past the text length
  // throws rather than clamping.
  const _clamped = {
    start: Math.min(Math.max(0, newSelection.start), newText.length),
    end: Math.min(Math.max(0, newSelection.end), newText.length),
  };

  setTextAndSelection({
    text: newText,
    selection:
      _clamped.end < _clamped.start ? { start: _clamped.start, end: _clamped.start } : _clamped,
  });
};
