import { extractUploadPlaceholderNames } from './uploadPlaceholder';

describe('extractUploadPlaceholderNames', () => {
  it('returns nothing for a body with no placeholder', () => {
    expect(extractUploadPlaceholderNames('hello ![alt](https://x/y.png)')).toEqual([]);
  });

  it('returns nothing for an empty or missing body', () => {
    expect(extractUploadPlaceholderNames('')).toEqual([]);
    expect(extractUploadPlaceholderNames(undefined)).toEqual([]);
  });

  it('extracts a single filename', () => {
    expect(extractUploadPlaceholderNames('a\n![](Uploading... img.jpg)\nb')).toEqual(['img.jpg']);
  });

  it('extracts filenames containing parentheses', () => {
    expect(extractUploadPlaceholderNames('![](Uploading... IMG_2024 (1).jpg)')).toEqual([
      'IMG_2024 (1).jpg',
    ]);
  });

  it('extracts every placeholder, ignoring alt text and real images', () => {
    const body = '![ok](https://x/y.png)\n![](Uploading... a.jpg)\n![zz](Uploading... b.png)\nend';
    expect(extractUploadPlaceholderNames(body)).toEqual(['a.jpg', 'b.png']);
  });
});
