import { isStringWebLink, replaceBetween } from './utils';

export const writeUrlTextHere = 'https://example.com';
export const writeTextHereString = 'Text here';

export default async ({
  text,
  selection,
  setTextAndSelection,
  item,
  isImage = null,
  isVideo = null,
}) => {
  const imagePrefix = isImage ? '!' : '';
  const itemText = item ? item.text : writeTextHereString;
  const itemUrl = item ? item.url : writeUrlTextHere;
  const isRawUrl = item && !item.text;
  let newText;
  let newSelection;
  const selectedText = text.substring(selection.start, selection.end);

  if (selection.start !== selection.end) {
    if (isStringWebLink(selectedText)) {
      newText = replaceBetween(text, selection, `${imagePrefix}[${itemText}](${selectedText})`);
      newSelection = {
        // start: selection.start + 1,
        // end: selection.start + 1 + itemText && itemText.length,
        start: newText.length,
        end: newText.length,
      };
    } else {
      newText = replaceBetween(text, selection, `${imagePrefix}[${selectedText}](${itemUrl})`);
      newSelection = {
        // start: selection.end + 3,
        // end: selection.end + 3 + itemUrl.length,
        start: newText.length,
        end: newText.length,
      };
    }
  } else {
    newText = replaceBetween(
      text,
      selection,
      isVideo
        ? `\n${itemUrl}\n`
        : isRawUrl
        ? `${itemUrl}`
        : isImage
        ? `\n${imagePrefix}[${itemText}](${itemUrl})\n`
        : `${imagePrefix}[${itemText}](${itemUrl})`,
    );
    if (isImage) {
      const newIndex = newText && newText.indexOf(itemUrl) + 2 + itemUrl.length;
      newSelection = {
        start: newIndex,
        end: newIndex,
      };
    } else {
      newSelection = {
        start: newText.length,
        end: newText.length,
        // start: hasLabel ? selection.start + 1 : 0,
        // end: hasLabel ? selection.start + 1 + (itemText && itemText.length) : 0,
      };
    }
  }

  setTextAndSelection({ text: newText, selection: newSelection });
};
