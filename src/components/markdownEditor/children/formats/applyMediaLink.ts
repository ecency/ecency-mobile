import {
  MediaInsertData,
  MediaInsertStatus,
} from '../../../uploadsGalleryModal/container/uploadsGalleryModal';
import { replaceBetween } from './utils';

interface Selection {
  start: number;
  end: number;
}

interface Args {
  text: string;
  selection: Selection;
  setTextAndSelection: ({ selection: Selection, text: string }) => void;
  items: MediaInsertData[];
}

export default async ({ text, selection, setTextAndSelection, items }: Args) => {
  // TODO: check if placeholder already present in text body
  // check if cursor position is after or before media position
  // replace placeholder with url or failure message
  // calclulate change of cursor position

  const imagePrefix = '!';
  const placeholderPrefix = 'Uploading... ';

  let newText = text;
  let newSelection = selection;

  const _insertFormatedString = (text, value) => {
    const formatedText = `\n${imagePrefix}[${text}](${value})\n`;
    newText = replaceBetween(newText, newSelection, formatedText);
    const newIndex = newText && newText.indexOf(value, newSelection.start) + value.length + 2;
    newSelection = {
      start: newIndex,
      end: newIndex,
    };
  };

  const _replaceFormatedString = (placeholder: string, url: string) => {
    const replaceStr = `(${placeholder})`;

    const endingIndex = newText.indexOf(replaceStr) + replaceStr.length + 1;
    newText = newText.replace(replaceStr, `(${url})`);

    if (newSelection.start >= endingIndex) {
      const lengthDiff = url.length - placeholder.length;
      newSelection = {
        start: newSelection.start + lengthDiff,
        end: newSelection.end + lengthDiff,
      };
    }
  };

  const _removeFormatedString = (placeholder) => {
    const formatedText = `${imagePrefix}[](${placeholder})`;
    const formatedTextIndex = newText.indexOf(formatedText);
    newText = newText.replace(formatedText, '');

    if (newSelection.start > formatedTextIndex) {
      newSelection = {
        start: newSelection.start - formatedText.length,
        end: newSelection.end - formatedText.length,
      };
    }
  };

  items.forEach((item) => {
    const _placeholder = item.filename && `${placeholderPrefix}${item.filename}`;

    switch (item.status) {
      case MediaInsertStatus.UPLOADING: // means only filename is available
        if (!_placeholder) return;
        _insertFormatedString(item.text, _placeholder);
        break;

      case MediaInsertStatus.READY: // means url is ready but filename may be available
        if (_placeholder && newText.includes(_placeholder)) {
          // means placeholder is preset is needs replacing
          _replaceFormatedString(_placeholder, item.url);
        } else if (item.url) {
          _insertFormatedString(item.text, item.url);
        }
        break;

      case MediaInsertStatus.FAILED: // filename available but upload failed
        if (_placeholder && newText.includes(_placeholder)) {
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

  setTextAndSelection({ text: newText, selection: newSelection });
};
