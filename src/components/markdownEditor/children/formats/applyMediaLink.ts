import { MediaInsertData, MediaInsertStatus, Modes } from '../../../uploadsGalleryModal/types';
import { replaceBetween } from './utils';

interface Selection {
  start: number;
  end: number;
}

interface Args {
  text: string;
  selection: Selection;
  setTextAndSelection: (args: { selection: Selection; text: string }) => void;
  items: MediaInsertData[];
}

const imagePrefix = '!';

export const uploadPlaceholderPrefix = 'Uploading... ';

// Any upload placeholder this editor may have written: `![alt](Uploading... name)`.
// Used to recover a placeholder whose filename got mangled (by the typing race or a
// stray edit) and to sweep orphans out of restored drafts. Alt and filename exclude
// newlines so the match can never swallow surrounding body text.
export const uploadPlaceholderPattern = () => /!\[[^\]\n]*\]\(Uploading\.\.\.[^)\n]*\)/g;

export default async ({ text, selection, setTextAndSelection, items }: Args) => {
  let newText = text;
  let newSelection = selection;

  const _shiftSelectionAfter = (index: number, lengthDiff: number) => {
    // Keep the caret in place relative to the text the user is editing: only
    // positions at/after the edited region move.
    if (newSelection.start >= index) {
      newSelection = {
        start: Math.max(0, newSelection.start + lengthDiff),
        end: Math.max(0, newSelection.end + lengthDiff),
      };
    }
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
    _shiftSelectionAfter(replaceIndex + replaceStr.length + 1, url.length - placeholder.length);
  };

  // The exact placeholder is gone (the user edited it, or a stray keystroke landed
  // inside it). If exactly one upload placeholder remains in the body it can only be
  // this upload's, so repair it in place. With zero or several candidates the target
  // is unknowable: drop the insert rather than writing at the live caret, which lands
  // the image mid-sentence wherever the user happens to be typing. The upload itself
  // is safe in the uploads gallery either way.
  const _findLonePlaceholder = () => {
    const matches = [...newText.matchAll(uploadPlaceholderPattern())];
    return matches.length === 1 ? matches[0] : undefined;
  };

  const _replaceLonePlaceholder = (match: RegExpMatchArray, url: string) => {
    const parenIndex = match[0].indexOf('](') + 1;
    const start = (match.index as number) + parenIndex;
    const oldLength = match[0].length - parenIndex;
    newText = `${newText.slice(0, start)}(${url})${newText.slice(start + oldLength)}`;
    _shiftSelectionAfter(start + oldLength, url.length + 2 - oldLength);
  };

  const _removeAt = (index: number, length: number) => {
    newText = newText.slice(0, index) + newText.slice(index + length);
    _shiftSelectionAfter(index + length, -length);
  };

  const _removeFormatedString = (placeholder: string) => {
    const formatedText = `${imagePrefix}[](${placeholder})`;
    const formatedTextIndex = newText.indexOf(formatedText);
    if (formatedTextIndex >= 0) {
      _removeAt(formatedTextIndex, formatedText.length);
      return;
    }
    const lone = _findLonePlaceholder();
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
            const lone = _findLonePlaceholder();
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
          _removeFormatedString(_placeholder);
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

  setTextAndSelection({ text: newText, selection: newSelection });
};
