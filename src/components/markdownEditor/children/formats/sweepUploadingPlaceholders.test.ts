import { sweepUploadingPlaceholders } from './sweepUploadingPlaceholders';

describe('sweepUploadingPlaceholders', () => {
  it('returns the body unchanged when it holds no placeholder', () => {
    const body = 'hello\n![alt](https://images.ecency.com/x.png)\nworld';
    expect(sweepUploadingPlaceholders(body, 7)).toEqual({ text: body, caret: 7 });
  });

  it('does not touch prose that merely mentions Uploading...', () => {
    const body = 'the app said (Uploading... img.jpg) forever';
    expect(sweepUploadingPlaceholders(body).text).toBe(body);
  });

  it('strips a placeholder and absorbs one trailing newline', () => {
    const { text } = sweepUploadingPlaceholders('hello\n![](Uploading... img.jpg)\nworld');
    expect(text).toBe('hello\nworld');
  });

  it('strips a placeholder at the start of the body', () => {
    const { text } = sweepUploadingPlaceholders('![](Uploading... img.jpg)\nhello');
    expect(text).toBe('hello');
  });

  it('strips a placeholder at the end of the body, absorbing the leading newline', () => {
    const { text } = sweepUploadingPlaceholders('hello\n![](Uploading... img.jpg)');
    expect(text).toBe('hello');
  });

  it('strips placeholders with alt text and mangled filenames', () => {
    const { text } = sweepUploadingPlaceholders('a\n![zz](Uploading... imXX)\nb');
    expect(text).toBe('a\nb');
  });

  it('strips a placeholder whose filename contains parentheses, leaving no garbage', () => {
    const { text } = sweepUploadingPlaceholders('hi\n![](Uploading... IMG_2024 (1).jpg)\nbye');
    expect(text).toBe('hi\nbye');
  });

  it('absorbs a CRLF line break without leaving a stray carriage return', () => {
    const { text } = sweepUploadingPlaceholders('hi\r\n![](Uploading... img.jpg)\r\nbye');
    expect(text).toBe('hi\r\nbye');
  });

  it('absorbs the TRAILING CRLF when the placeholder starts the body', () => {
    // no preceding newline to absorb here, so the trailing branch is the only one
    // that can keep a bare \r\n from being left behind
    const { text } = sweepUploadingPlaceholders('![](Uploading... img.jpg)\r\nbye');
    expect(text).toBe('bye');
  });

  it('absorbs the LEADING CRLF when the placeholder ends the body', () => {
    const { text } = sweepUploadingPlaceholders('hi\r\n![](Uploading... img.jpg)');
    expect(text).toBe('hi');
  });

  it('does not swallow text that follows a placeholder on the same line', () => {
    const { text } = sweepUploadingPlaceholders('![](Uploading... img.jpg) see (this) too');
    expect(text).toBe(' see (this) too');
  });

  it('strips several placeholders, including adjacent ones, without eating body text', () => {
    const body = 'a\n![](Uploading... 1.jpg)\n![](Uploading... 2.jpg)\nb';
    const { text } = sweepUploadingPlaceholders(body);
    expect(text).toBe('a\nb');
  });

  it('keeps real images that sit next to a placeholder', () => {
    const body = '![ok](https://x/y.png)\n![](Uploading... img.jpg)\ndone';
    const { text } = sweepUploadingPlaceholders(body);
    expect(text).toBe('![ok](https://x/y.png)\ndone');
  });

  describe('caret adjustment', () => {
    const body = 'hello\n![](Uploading... img.jpg)\nworld';
    // removal spans '![](Uploading... img.jpg)\n' -> indices 6..32

    it('keeps a caret before the placeholder in place', () => {
      expect(sweepUploadingPlaceholders(body, 3).caret).toBe(3);
    });

    it('shifts a caret after the placeholder back by the removed length', () => {
      // caret at the very end (37) -> swept length (11)
      expect(sweepUploadingPlaceholders(body, 37).caret).toBe(11);
    });

    it('lands a caret that sat inside the placeholder at the removal start', () => {
      expect(sweepUploadingPlaceholders(body, 15).caret).toBe(6);
    });

    it('passes an undefined caret through', () => {
      expect(sweepUploadingPlaceholders(body).caret).toBeUndefined();
    });
  });
});
