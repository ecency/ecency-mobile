import { appendDictatedText } from './dictationInsert';

describe('appendDictatedText', () => {
  it('uses the transcript as-is when the body is empty', () => {
    expect(appendDictatedText('', 'hello there')).toBe('hello there');
  });

  it('separates a new segment from an existing body', () => {
    expect(appendDictatedText('hello', 'there')).toBe('hello there');
  });

  it('does not double a space the body already ends with', () => {
    expect(appendDictatedText('hello ', 'there')).toBe('hello there');
  });

  it('does not add a space after a trailing newline', () => {
    expect(appendDictatedText('hello\n', 'there')).toBe('hello\nthere');
  });

  it('trims the transcript before appending', () => {
    expect(appendDictatedText('hello', '  there  ')).toBe('hello there');
  });

  it('leaves the body untouched for a blank transcript', () => {
    expect(appendDictatedText('hello', '   ')).toBe('hello');
    expect(appendDictatedText('hello', '')).toBe('hello');
  });

  it('keeps appending across several segments', () => {
    const first = appendDictatedText('', 'one');
    const second = appendDictatedText(first, 'two');
    expect(appendDictatedText(second, 'three')).toBe('one two three');
  });
});
