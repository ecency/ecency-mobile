import {replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, items }) => {
    const imagePrefix =  '!';

    let newText = text;
    let newSelection = selection;

    items.forEach(item => {
        if(item.url){
            const formatedText = `\n${imagePrefix}[${item.text}](${item.url})\n`
            newText = replaceBetween(newText, newSelection, formatedText);
            const newIndex = newText && newText.indexOf(item.url, newSelection.start) + item.url.length + 2;
            newSelection = {
                start: newIndex,
                end: newIndex
            }
        }
    });
  

  setTextAndSelection({ text: newText, selection: newSelection });
};
