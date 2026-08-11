import React from 'react';
import { renderTextWithBoldMentions } from './messageFormatters';

/**
 * Guards the integration, not the parser (inlineMarkdown.test.ts covers that).
 *
 * The property that matters here is that a URL is handed to <Hyperlink> as an untouched raw
 * string. Splitting one into styled <Text> nodes would stop it being tappable, and a URL
 * containing "_" could otherwise be reformatted into something that no longer resolves.
 */

/** Minimal stand-in for the linkify instance the chat screen passes in. */
const linkify = (urls: string[]) => ({
  match: (text: string) => {
    const found: Array<{ index: number; raw: string }> = [];
    urls.forEach((u) => {
      const i = text.indexOf(u);
      if (i !== -1) {
        found.push({ index: i, raw: u });
      }
    });
    return found.length ? found : null;
  },
});

type Node = React.ReactElement | string;

const nodes = (out: React.ReactNode): Node[] => (Array.isArray(out) ? out.flat(3) : [out as Node]);

/** Concatenates all text, whether it came back as a raw string or inside a <Text>. */
const allText = (out: React.ReactNode): string =>
  nodes(out)
    .map((n) => (typeof n === 'string' ? n : (n as any)?.props?.children ?? ''))
    .join('');

/** The raw strings only — these are what <Hyperlink> can still see and linkify. */
const rawStrings = (out: React.ReactNode): string[] =>
  nodes(out).filter((n): n is string => typeof n === 'string');

const styledNodes = (out: React.ReactNode) =>
  nodes(out).filter((n) => typeof n !== 'string') as React.ReactElement[];

const styleOf = (el: React.ReactElement) => {
  const s = (el.props as any).style;
  return Object.assign({}, ...(Array.isArray(s) ? s.flat(3) : [s]).filter(Boolean));
};

describe('chat message rendering — links are never reformatted', () => {
  it('keeps a URL with underscores as one raw string', () => {
    const url = 'https://ecency.com/@user/my_great_post_here';
    const out = renderTextWithBoldMentions(`look at ${url} please`, {}, linkify([url]));

    expect(rawStrings(out).join('')).toContain(url);
    expect(allText(out)).toBe(`look at ${url} please`);
    expect(styledNodes(out)).toHaveLength(0);
  });

  it('formats markdown around a link without touching the link', () => {
    const url = 'https://ecency.com/@user/post_one';
    const out = renderTextWithBoldMentions(`**wow** see ${url} now`, {}, linkify([url]));

    expect(rawStrings(out).join('')).toContain(url);
    const styled = styledNodes(out);
    expect(styled).toHaveLength(1);
    expect((styled[0].props as any).children).toBe('wow');
    expect(styleOf(styled[0]).fontWeight).toBe('700');
  });

  it('does not italicise asterisks that live inside a URL', () => {
    const url = 'https://example.com/a*b*c';
    const out = renderTextWithBoldMentions(`link ${url} end`, {}, linkify([url]));

    expect(rawStrings(out).join('')).toContain(url);
    expect(styledNodes(out)).toHaveLength(0);
  });
});

describe('chat message rendering — markdown and mentions coexist', () => {
  it('applies markdown when there are no mentions at all', () => {
    const out = renderTextWithBoldMentions('this is **important**', {}, linkify([]));
    const styled = styledNodes(out);

    expect(styled).toHaveLength(1);
    expect((styled[0].props as any).children).toBe('important');
    expect(allText(out)).toBe('this is important');
  });

  it('keeps mentions bold alongside markdown', () => {
    const out = renderTextWithBoldMentions('hey @rainkiss this is *urgent*', {}, linkify([]));
    const styled = styledNodes(out);

    const mention = styled.find((n) => (n.props as any).children === '@rainkiss');
    const italic = styled.find((n) => (n.props as any).children === 'urgent');

    expect(mention).toBeTruthy();
    expect(styleOf(mention!).fontWeight).toBe('700');
    expect(italic).toBeTruthy();
    expect(styleOf(italic!).fontStyle).toBe('italic');
    expect(allText(out)).toBe('hey @rainkiss this is urgent');
  });

  it('leaves an ordinary message completely untouched', () => {
    const plain = 'just saying hello everyone';
    const out = renderTextWithBoldMentions(plain, {}, linkify([]));

    expect(allText(out)).toBe(plain);
    expect(styledNodes(out)).toHaveLength(0);
  });

  it('does not format snake_case in ordinary chat', () => {
    const out = renderTextWithBoldMentions('the file_name_here is set', {}, linkify([]));

    expect(allText(out)).toBe('the file_name_here is set');
    expect(styledNodes(out)).toHaveLength(0);
  });
});
