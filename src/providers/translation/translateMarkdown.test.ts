import { translateMarkdown } from './translateMarkdown';
import translationApi from '../../config/translationApi';

jest.mock('../../config/translationApi', () => ({
  __esModule: true,
  default: { post: jest.fn(), get: jest.fn() },
}));
jest.mock('@sentry/react-native', () => ({ captureException: jest.fn() }));

const mockedPost = translationApi.post as jest.Mock;

// Reversible fake: every request comes back wrapped in «…» so tests can assert
// both that a piece of text was translated and that its position/markers were
// left intact.
const wrap = (text: string) => `«${text}»`;

beforeEach(() => {
  mockedPost.mockReset();
  mockedPost.mockImplementation((_url: string, body: { q: string }) =>
    Promise.resolve({ data: { translatedText: wrap(body.q) } }),
  );
});

describe('translateMarkdown', () => {
  it('translates plain paragraphs and rejoins them with blank lines', async () => {
    const result = await translateMarkdown('First paragraph.\n\nSecond paragraph.', 'es', 'en');

    expect(result).toBe(wrap('First paragraph.\n\nSecond paragraph.'));
  });

  it('batches consecutive plain paragraphs into a single request', async () => {
    await translateMarkdown('First paragraph.\n\nSecond paragraph.', 'es', 'en');

    expect(mockedPost).toHaveBeenCalledTimes(1);
    expect(mockedPost.mock.calls[0][1].q).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('returns empty/whitespace-only input unchanged without any request', async () => {
    expect(await translateMarkdown('', 'es', 'en')).toBe('');
    expect(await translateMarkdown('   \n\n  ', 'es', 'en')).toBe('   \n\n  ');
    expect(mockedPost).not.toHaveBeenCalled();
  });

  it('passes fenced code blocks through untouched, including inner blank lines', async () => {
    const fence = '```js\nconst a = 1;\n\nconst b = 2;\n```';
    const result = await translateMarkdown(`Intro.\n\n${fence}\n\nOutro.`, 'es', 'en');

    expect(result).toBe(`${wrap('Intro.')}\n\n${fence}\n\n${wrap('Outro.')}`);
    // The fence must break batching: intro and outro are separate requests.
    expect(mockedPost).toHaveBeenCalledTimes(2);
  });

  it('keeps an unclosed fence at the end of the document untouched', async () => {
    const result = await translateMarkdown('Text.\n\n```py\nx = 1', 'es', 'en');

    expect(result).toBe(`${wrap('Text.')}\n\n\`\`\`py\nx = 1`);
  });

  it('treats a fence directly under a heading as its own block', async () => {
    const result = await translateMarkdown('## Setup\n```bash\nnpm i\n```', 'es', 'en');

    expect(result).toBe(`## ${wrap('Setup')}\n\n\`\`\`bash\nnpm i\n\`\`\``);
  });

  it('skips image-only blocks but translates a paragraph containing an image line', async () => {
    const result = await translateMarkdown(
      [
        'Hello.',
        '![alt](https://images.ecency.com/pic.png)',
        'Look:\n![inline](https://x/y.png)\nWhat a view.',
      ].join('\n\n'),
      'es',
      'en',
    );

    expect(result).toBe(
      [
        wrap('Hello.'),
        '![alt](https://images.ecency.com/pic.png)',
        wrap('Look:\n![inline](https://x/y.png)\nWhat a view.'),
      ].join('\n\n'),
    );
  });

  it('skips a block of stacked image lines', async () => {
    const images = '![one](https://x/1.png)\n![two](https://x/2.png)';
    const result = await translateMarkdown(`Intro.\n\n${images}`, 'es', 'en');

    expect(result).toBe(`${wrap('Intro.')}\n\n${images}`);
  });

  it('skips tables entirely', async () => {
    const table = '| Name | Age |\n| --- | --- |\n| Ana | 30 |';
    const result = await translateMarkdown(`Intro.\n\n${table}\n\nOutro.`, 'es', 'en');

    expect(result).toBe(`${wrap('Intro.')}\n\n${table}\n\n${wrap('Outro.')}`);
  });

  it('skips raw HTML blocks', async () => {
    const html = '<div class="pull-left">\nHola\n</div>';
    const result = await translateMarkdown(`Intro.\n\n${html}\n\nOutro.`, 'es', 'en');

    expect(result).toBe(`${wrap('Intro.')}\n\n${html}\n\n${wrap('Outro.')}`);
  });

  it('skips horizontal rules and URL-only lines, never batching across them', async () => {
    const result = await translateMarkdown(
      'One.\n\n---\n\nTwo.\n\nhttps://example.com/page\n\nThree.',
      'es',
      'en',
    );

    expect(result).toBe(
      [wrap('One.'), '---', wrap('Two.'), 'https://example.com/page', wrap('Three.')].join('\n\n'),
    );
    expect(mockedPost).toHaveBeenCalledTimes(3);
  });

  it('keeps spaced horizontal rules like * * * untouched', async () => {
    const result = await translateMarkdown('One.\n\n* * *\n\nTwo.', 'es', 'en');

    expect(result).toBe(`${wrap('One.')}\n\n* * *\n\n${wrap('Two.')}`);
  });

  it('preserves heading markers and translates only the heading text', async () => {
    const result = await translateMarkdown('# Mi viaje\n\n### Otro dia', 'es', 'en');

    expect(result).toBe(`# ${wrap('Mi viaje')}\n\n### ${wrap('Otro dia')}`);
  });

  it('preserves quote and list markers line by line', async () => {
    const result = await translateMarkdown(
      '> una cita\n\n- primero\n- segundo\n\n1. uno\n2. dos',
      'es',
      'en',
    );

    expect(result).toBe(
      [
        `> ${wrap('una cita')}`,
        `- ${wrap('primero')}\n- ${wrap('segundo')}`,
        `1. ${wrap('uno')}\n2. ${wrap('dos')}`,
      ].join('\n\n'),
    );
  });

  it('preserves nested list markers with their indentation', async () => {
    const result = await translateMarkdown('- parent\n  - child\n    1. deep', 'es', 'en');

    expect(result).toBe(`- ${wrap('parent')}\n  - ${wrap('child')}\n    1. ${wrap('deep')}`);
  });

  it('preserves leading indentation on marker-less continuation lines', async () => {
    const result = await translateMarkdown('- item uno\n    continua aqui', 'es', 'en');

    expect(result).toBe(`- ${wrap('item uno')}\n    ${wrap('continua aqui')}`);
  });

  it('keeps image and URL lines inside a list untouched', async () => {
    const result = await translateMarkdown(
      '- texto\n- ![pic](https://x/1.png)\n- https://example.com',
      'es',
      'en',
    );

    expect(result).toBe(`- ${wrap('texto')}\n- ![pic](https://x/1.png)\n- https://example.com`);
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  it('keeps a marker-only line as-is instead of sending an empty request', async () => {
    const result = await translateMarkdown('> \n> cita', 'es', 'en');

    expect(result).toBe(`> \n> ${wrap('cita')}`);
    expect(mockedPost).toHaveBeenCalledTimes(1);
  });

  it('splits batches once they exceed the size limit', async () => {
    const blockA = 'a'.repeat(900);
    const blockB = 'b'.repeat(900);
    await translateMarkdown(`${blockA}\n\n${blockB}`, 'es', 'en');

    expect(mockedPost).toHaveBeenCalledTimes(2);
    expect(mockedPost.mock.calls[0][1].q).toBe(blockA);
    expect(mockedPost.mock.calls[1][1].q).toBe(blockB);
  });

  it('chunks a single oversized paragraph instead of sending one huge request', async () => {
    const words = Array.from({ length: 400 }, (_, i) => `palabra${i}`).join(' ');
    await translateMarkdown(words, 'es', 'en');

    expect(mockedPost.mock.calls.length).toBeGreaterThan(1);
    mockedPost.mock.calls.forEach(([, body]) => expect(body.q.length).toBeLessThanOrEqual(1500));
  });

  it('chunks a single overlong marked line into multiple requests', async () => {
    const long = Array.from({ length: 200 }, (_, i) => `palabra${i}`).join(' ');
    const result = await translateMarkdown(`- ${long}`, 'es', 'en');

    expect(mockedPost.mock.calls.length).toBeGreaterThan(1);
    expect(result.startsWith('- ')).toBe(true);
    // Stripping the wrap markers must restore the original text: no words may
    // be lost or duplicated at chunk boundaries.
    expect(result.slice(2).replace(/[«»]/g, '')).toBe(long);
  });

  it('keeps emoji out of the request and re-attaches them to the result', async () => {
    const result = await translateMarkdown('Hola amigos 😊', 'es', 'en');

    expect(mockedPost.mock.calls[0][1].q).toBe('Hola amigos');
    expect(result).toBe(`${wrap('Hola amigos')} 😊`);
  });

  it('normalizes CRLF input', async () => {
    const result = await translateMarkdown('First.\r\n\r\nSecond.', 'es', 'en');

    expect(result).toBe(wrap('First.\n\nSecond.'));
  });

  it('tolerates trailing whitespace without emitting empty blocks', async () => {
    const result = await translateMarkdown('Hola mundo.   \n\n', 'es', 'en');

    expect(result).toBe(wrap('Hola mundo.   '));
  });

  it('reports progress per request, starting at zero', async () => {
    const onProgress = jest.fn();
    await translateMarkdown('One.\n\n---\n\nTwo.\n\n---\n\nThree.', 'es', 'en', onProgress);

    expect(onProgress.mock.calls).toEqual([
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 3],
    ]);
  });

  it('rejects on any request failure instead of returning a partial result', async () => {
    mockedPost
      .mockImplementationOnce((_url: string, body: { q: string }) =>
        Promise.resolve({ data: { translatedText: wrap(body.q) } }),
      )
      .mockRejectedValueOnce(new Error('boom'));

    await expect(
      translateMarkdown('One.\n\n---\n\nTwo.\n\n---\n\nThree.', 'es', 'en'),
    ).rejects.toThrow('boom');
  });

  it('stops issuing requests once cancelled', async () => {
    let calls = 0;
    mockedPost.mockImplementation((_url: string, body: { q: string }) => {
      calls += 1;
      return Promise.resolve({ data: { translatedText: wrap(body.q) } });
    });

    await expect(
      translateMarkdown(
        'One.\n\n---\n\nTwo.\n\n---\n\nThree.',
        'es',
        'en',
        undefined,
        () => calls >= 1,
      ),
    ).rejects.toThrow('translate-cancelled');
    expect(calls).toBe(1);
  });

  it('handles a mixed document end to end', async () => {
    const input = [
      '# Titulo',
      'Un parrafo con texto.',
      '```\ncode\n\nmore code\n```',
      '> cita famosa',
      '| a | b |\n|---|---|\n| 1 | 2 |',
      '![foto](https://x/f.jpg)',
      'Cierre.',
    ].join('\n\n');

    const result = await translateMarkdown(input, 'es', 'en');

    expect(result).toBe(
      [
        `# ${wrap('Titulo')}`,
        wrap('Un parrafo con texto.'),
        '```\ncode\n\nmore code\n```',
        `> ${wrap('cita famosa')}`,
        '| a | b |\n|---|---|\n| 1 | 2 |',
        '![foto](https://x/f.jpg)',
        wrap('Cierre.'),
      ].join('\n\n'),
    );
  });
  it('still skips a real GFM table (separator directly under the header row)', async () => {
    const table = '| a | b |\n|---|---|\n| 1 | 2 |';
    const result = await translateMarkdown(`Intro.\n\n${table}`, 'es', 'en');

    expect(result).toBe(`\u00abIntro.\u00bb\n\n${table}`);
  });

  it('translates prose containing pipes and a stray separator-like line', async () => {
    const block = 'El valor |x| es absoluto\nnota al margen\n|---|';
    const result = await translateMarkdown(block, 'es', 'en');

    expect(result).toContain('\u00ab');
    expect(mockedPost).toHaveBeenCalled();
  });

  it('translates pipe prose directly above a separator when cell counts differ', async () => {
    const block = 'El valor |x| es absoluto\n|---|';
    const result = await translateMarkdown(block, 'es', 'en');

    expect(result).toContain('\u00ab');
    expect(mockedPost).toHaveBeenCalled();
  });

  it('still skips a borderless GFM table (header without outer pipes)', async () => {
    const table = 'a | b\n--- | ---\n1 | 2';
    const result = await translateMarkdown(table, 'es', 'en');

    expect(result).toBe(table);
    expect(mockedPost).not.toHaveBeenCalled();
  });
});
