import { parseInlineMarkdown } from './inlineMarkdown';

/** Collapses spans back to text, to assert nothing is ever dropped. */
const flat = (s: string) =>
  parseInlineMarkdown(s)
    .map((p) => p.text)
    .join('');

const styled = (s: string) =>
  parseInlineMarkdown(s).filter((p) => p.bold || p.italic || p.strike || p.code);

describe('parseInlineMarkdown — formatting', () => {
  it('renders bold', () => {
    expect(parseInlineMarkdown('this is **important** stuff')).toEqual([
      { text: 'this is ' },
      { text: 'important', bold: true },
      { text: ' stuff' },
    ]);
  });

  it('renders italic with both delimiters', () => {
    expect(styled('an *emphatic* word')).toEqual([{ text: 'emphatic', italic: true }]);
    expect(styled('an _emphatic_ word')).toEqual([{ text: 'emphatic', italic: true }]);
  });

  it('renders strikethrough', () => {
    expect(styled('~~nope~~ yes')).toEqual([{ text: 'nope', strike: true }]);
  });

  it('renders inline code', () => {
    expect(styled('run `yarn test` now')).toEqual([{ text: 'yarn test', code: true }]);
  });

  it('nests italic inside bold', () => {
    expect(parseInlineMarkdown('**very *very* bold**')).toEqual([
      { text: 'very ', bold: true },
      { text: 'very', bold: true, italic: true },
      { text: ' bold', bold: true },
    ]);
  });

  it('treats code spans as literal, so markdown inside them is not parsed', () => {
    expect(parseInlineMarkdown('`a **b** c`')).toEqual([{ text: 'a **b** c', code: true }]);
  });
});

describe('parseInlineMarkdown — leaves ordinary text alone', () => {
  it('does not italicise snake_case identifiers', () => {
    expect(styled('file_name_here and snake_case_var')).toEqual([]);
    expect(flat('file_name_here and snake_case_var')).toBe('file_name_here and snake_case_var');
  });

  it('does not mangle a URL containing underscores', () => {
    const url = 'https://ecency.com/@user/my_great_post_here';
    expect(styled(url)).toEqual([]);
    expect(flat(url)).toBe(url);
  });

  it('does not italicise spaced asterisks used as multiplication', () => {
    expect(styled('2 * 3 * 4 = 24')).toEqual([]);
    expect(flat('2 * 3 * 4 = 24')).toBe('2 * 3 * 4 = 24');
  });

  it('still finds a valid pair after an invalid opening delimiter', () => {
    // regression: skipping an invalid "*" must keep scanning the SAME rule, not abandon it
    expect(styled('2 * 3 and *italic* here')).toEqual([{ text: 'italic', italic: true }]);
    expect(flat('2 * 3 and *italic* here')).toBe('2 * 3 and italic here');
    expect(styled('a_b and _real_ emphasis')).toEqual([{ text: 'real', italic: true }]);
  });

  it('leaves an unterminated delimiter as literal text', () => {
    expect(styled('*hello there')).toEqual([]);
    expect(flat('*hello there')).toBe('*hello there');
    expect(flat('a ** b')).toBe('a ** b');
  });

  it('leaves bare delimiters alone', () => {
    ['***', '___', '~~', '`', '*', '_'].forEach((s) => {
      expect(flat(s)).toBe(s);
    });
  });

  it('handles empty and plain input', () => {
    expect(parseInlineMarkdown('')).toEqual([]);
    expect(parseInlineMarkdown('just chatting')).toEqual([{ text: 'just chatting' }]);
  });

  it('does not treat block syntax as inline formatting', () => {
    // lists, headings and quotes stay literal by design
    ['- a point', '# heading', '> quoted'].forEach((s) => {
      expect(flat(s)).toBe(s);
      expect(styled(s)).toEqual([]);
    });
  });
});

describe('parseInlineMarkdown — never loses content', () => {
  it('preserves every character except consumed delimiters', () => {
    const samples = [
      'hey **there** how are _you_ today',
      'mixed **bold _and italic_** together',
      'code `x` and **bold**',
      'emoji 🥰 with **bold** after',
      'a*b*c',
      '**',
      'trailing *',
      'multi\nline **bold** text',
    ];
    samples.forEach((s) => {
      const out = flat(s);
      // every non-delimiter character survives, in order
      const strip = (t: string) => t.replace(/[*_~`]/g, '');
      expect(strip(out)).toBe(strip(s));
    });
  });

  it('terminates on pathological delimiter soup', () => {
    const nasty = `${'*'.repeat(200)}x${'_'.repeat(200)}`;
    const started = Date.now();
    const out = flat(nasty);
    expect(Date.now() - started).toBeLessThan(1000);
    expect(out.replace(/[*_~`]/g, '')).toBe('x');
  });
});
