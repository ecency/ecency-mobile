import { replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, item }) => {
  const newText = replaceBetween(
    text,
    selection,
    item.wrapper.concat(text.substring(selection.start, selection.end), item.wrapper),
  );
  let newPosition;

  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length;
  } else {
    newPosition = selection.end + item.wrapper.length * 2;
  }
  const newSelection = { start: newPosition, end: newPosition };
  setTextAndSelection({ text: newText, selection: newSelection });
};
