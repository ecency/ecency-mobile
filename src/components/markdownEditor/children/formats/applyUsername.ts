import { extractWordAtIndex } from '../../../../utils/editor';
import { replaceBetween } from './utils';

export default async ({ text, selection, setTextAndSelection, username }) => {
  const _word = extractWordAtIndex(text, selection.start);
  const _insertAt = text.indexOf(_word, selection.start - _word.length);
  const _text = replaceBetween(
    text,
    { start: _insertAt, end: _insertAt + _word.length },
    `@${username} `,
  );
  const _newPos = _insertAt + username.length + 2;
  const _selection = { start: _newPos, end: _newPos };
  setTextAndSelection({ selection: _selection, text: _text });
};
