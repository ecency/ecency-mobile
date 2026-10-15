import { authEpoch, beginAuthRemoval, guardedAuthWrite } from './authWriteGuard';

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

describe('authWriteGuard', () => {
  it('lets a write through when nothing was removed meanwhile', async () => {
    const epoch = authEpoch('alice');
    await expect(guardedAuthWrite('alice', epoch, async () => 'written')).resolves.toBe('written');
  });

  it('skips a write once a removal of that account has begun', async () => {
    const epoch = authEpoch('alice');
    await beginAuthRemoval('alice');
    const write = jest.fn(async () => 'written');
    await expect(guardedAuthWrite('alice', epoch, write)).resolves.toBeNull();
    expect(write).not.toHaveBeenCalled();
  });

  it('skips every account when all are removed', async () => {
    const epoch = authEpoch('carol');
    await beginAuthRemoval();
    await expect(guardedAuthWrite('carol', epoch, async () => 'x')).resolves.toBeNull();
  });

  it('does not skip another account', async () => {
    const epoch = authEpoch('dave');
    await beginAuthRemoval('erin');
    await expect(guardedAuthWrite('dave', epoch, async () => 'x')).resolves.toBe('x');
  });

  it('makes a removal wait for a write already under way', async () => {
    const gate = deferred();
    const order: string[] = [];
    const writing = guardedAuthWrite('frank', authEpoch('frank'), async () => {
      await gate.promise;
      order.push('write');
    });
    const removing = (async () => {
      await beginAuthRemoval('frank');
      order.push('remove');
    })();
    await Promise.resolve();
    expect(order).toEqual([]);
    gate.resolve();
    await Promise.all([writing, removing]);
    expect(order).toEqual(['write', 'remove']);
  });
});
