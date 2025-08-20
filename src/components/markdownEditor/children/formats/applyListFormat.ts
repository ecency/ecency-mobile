import { replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, item }) => {
  let newText;
  let newSelection;

  text = text || '';

  const isSelected = selection.start === selection.end;
  const hasLineBreakOnStart = text.substring(selection.start - 1, selection.start) === '\n';
  const hasLineBreakOnEnd = text.substring(selection.end - 1, selection.end) === '\n';

  if (!isSelected && hasLineBreakOnStart) {
    newText = replaceBetween(
      text,
      selection,
      `${item.prefix} ${text.substring(selection.start, selection.end)}\n`,
    );
    newSelection = { start: selection.end + 3, end: selection.end + 3 };
  } else if (!isSelected && !hasLineBreakOnStart) {
    newText = replaceBetween(
      text,
      selection,
      `\n${item.prefix} ${text.substring(selection.start, selection.end)}\n`,
    );
    newSelection = { start: selection.end + 3, end: selection.end + 3 };
  } else if (isSelected && hasLineBreakOnEnd) {
    newText = replaceBetween(text, selection, `${item.prefix} `);
    newSelection = { start: selection.start + 2, end: selection.start + 2 };
  } else if (isSelected && !hasLineBreakOnEnd) {
    newText = replaceBetween(text, selection, `\n${item.prefix} `);
    newSelection = { start: selection.start + 3, end: selection.start + 3 };
  }

  setTextAndSelection({ text: newText, selection: newSelection });
};
