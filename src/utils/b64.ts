const b64uLookup = {
  '/': '_',
  _: '/',
  '+': '-',
  '-': '+',
  '=': '.',
  '.': '=',
};

export const b64uEnc = (str: string) =>
  Buffer.from(str)
    .toString('base64')
    .replace(/(\+|\/|=)/g, (m) => b64uLookup[m as keyof typeof b64uLookup]);
