const parseDate = (d: string): Date => new Date(`${d}.000Z`);

export default parseDate;
