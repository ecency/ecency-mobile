import { authEpoch, guardedAuthWrite, withAuthRemoval } from './authWriteGuard';

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

  it('skips a write taken before a removal of that account', async () => {
    const epoch = authEpoch('alice');
    await withAuthRemoval('alice', async () => undefined);
    const write = jest.fn(async () => 'written');
    await expect(guardedAuthWrite('alice', epoch, write)).resolves.toBeNull();
    expect(write).not.toHaveBeenCalled();
  });

  it('refuses writes during a removal, and from refreshes started during it', async () => {
    const gate = deferred();
    let epochDuring = '';
    const removing = withAuthRemoval('bob', async () => {
      epochDuring = authEpoch('bob'); // a refresh starting now takes this
      await expect(guardedAuthWrite('bob', epochDuring, async () => 'x')).resolves.toBeNull();
      await gate.promise;
    });
    await Promise.resolve();
    gate.resolve();
    await removing;
    // after the removal, the refresh that started during it is still refused
    await expect(guardedAuthWrite('bob', epochDuring, async () => 'x')).resolves.toBeNull();
    // one that starts afterwards is not
    await expect(guardedAuthWrite('bob', authEpoch('bob'), async () => 'x')).resolves.toBe('x');
  });

  it('skips every account when all are removed', async () => {
    const epoch = authEpoch('carol');
    await withAuthRemoval(undefined, async () => undefined);
    await expect(guardedAuthWrite('carol', epoch, async () => 'x')).resolves.toBeNull();
  });

  it('does not skip another account', async () => {
    const epoch = authEpoch('dave');
    await withAuthRemoval('erin', async () => undefined);
    await expect(guardedAuthWrite('dave', epoch, async () => 'x')).resolves.toBe('x');
  });

  it('makes a removal wait for a write already under way', async () => {
    const gate = deferred();
    const order: string[] = [];
    const writing = guardedAuthWrite('frank', authEpoch('frank'), async () => {
      await gate.promise;
      order.push('write');
    });
    const removing = withAuthRemoval('frank', async () => {
      order.push('remove');
    });
    await Promise.resolve();
    expect(order).toEqual([]);
    gate.resolve();
    await Promise.all([writing, removing]);
    expect(order).toEqual(['write', 'remove']);
  });

  it('ends the removal even when removing fails', async () => {
    await expect(
      withAuthRemoval('gina', async () => {
        throw new Error('disk full');
      }),
    ).rejects.toThrow('disk full');
    await expect(guardedAuthWrite('gina', authEpoch('gina'), async () => 'x')).resolves.toBe('x');
  });
});
