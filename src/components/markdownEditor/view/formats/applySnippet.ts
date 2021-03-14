import {replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, snippetText}) => {

  const newText = replaceBetween(text, selection, `\n${snippetText}\n`);
   const newSelection = {
       start: selection.start + 1,
      end: selection.start + 1 + (snippetText && snippetText.length),
    };
  setTextAndSelection({ text: newText, selection: newSelection });
};