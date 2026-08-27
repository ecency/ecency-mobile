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
