import { replaceBetween } from './utils';

export default async ({ text, selection, setText, setNewSelection, setSelection, item }) => {
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

  await setText(newText);
  await setNewSelection({ start: newPosition, end: newPosition });
  await setSelection({ start: newPosition, end: newPosition });
};
