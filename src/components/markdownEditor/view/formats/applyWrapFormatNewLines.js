import { replaceBetween } from './utils';

export default async ({ text, selection, setText, setNewSelection, item }) => {
  let newText = replaceBetween(
    text,
    selection,
    `\n${item.wrapper.concat(
      '\n',
      text.substring(selection.start, selection.end),
      '\n',
      item.wrapper,
      '\n',
    )}`,
  );
  let newPosition;
  if (selection.start === selection.end) {
    newPosition = selection.end + item.wrapper.length + 2; // +2 For two new lines
    newText = replaceBetween(
      text,
      selection,
      `\n${item.wrapper.concat(
        '\n',
        text.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
  } else {
    newPosition = selection.end + item.wrapper.length * 2 + 3; // +3 For three new lines
    newText = replaceBetween(
      text,
      selection,
      `${item.wrapper.concat(
        '\n',
        text.substring(selection.start, selection.end),
        '\n',
        item.wrapper,
        '\n',
      )}`,
    );
  }
  await setText(newText);
  await setNewSelection({ start: newPosition, end: newPosition });
};
