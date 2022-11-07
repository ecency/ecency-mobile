import { replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, snippetText }) => {
  const newText = replaceBetween(text, selection, `${snippetText}`);
  const newSelection = {
    start: selection.start,
    end: selection.start + (snippetText && snippetText.length),
  };
  setTextAndSelection({ text: newText, selection: newSelection });
};
