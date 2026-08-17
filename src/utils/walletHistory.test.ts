import { utils as hiveTxUtils } from '@ecency/sdk/hive';
import {
  HIVE_LAYER_HISTORY_OPS,
  getHistoryOpsForSymbol,
  matchesAssetTicker,
  orderChainActivities,
} from './walletHistory';
import { groomingTransactionData, transferTypes } from './wallet';

const hivePerMVests = 500;

describe('getHistoryOpsForSymbol', () => {
  it('returns a distinct set per Hive-layer token', () => {
    expect(getHistoryOpsForSymbol('HIVE')).toBe(HIVE_LAYER_HISTORY_OPS.HIVE);
    expect(getHistoryOpsForSymbol('HBD')).toBe(HIVE_LAYER_HISTORY_OPS.HBD);
    expect(getHistoryOpsForSymbol('HP')).toBe(HIVE_LAYER_HISTORY_OPS.HP);
  });

  it('falls back to the HIVE set for an unknown symbol', () => {
    expect(getHistoryOpsForSymbol('WHATEVER')).toBe(HIVE_LAYER_HISTORY_OPS.HIVE);
  });

  // The bug this whole module exists for: requesting every operation made a witness
  // account's page ~92% producer_reward, which transferTypes drops, so HIVE and HBD
  // rendered nothing at all.
  it('never requests operations the history cannot render', () => {
    Object.values(HIVE_LAYER_HISTORY_OPS).forEach((ops) => {
      expect(ops).not.toContain('producer_reward');
      ops.forEach((op) => {
        expect(transferTypes).toContain(op);
      });
    });
  });

  it('requests only operation names the chain actually defines', () => {
    Object.values(HIVE_LAYER_HISTORY_OPS).forEach((ops) => {
      ops.forEach((op) => {
        expect(typeof (hiveTxUtils.operations as Record<string, number>)[op]).toBe('number');
      });
    });
  });

  it('requests no operation twice', () => {
    Object.values(HIVE_LAYER_HISTORY_OPS).forEach((ops) => {
      expect(new Set(ops).size).toBe(ops.length);
    });
  });

  // Requestable only since @ecency/sdk 2.3.80; before that the per-asset select
  // discarded it however it was asked for.
  it('asks for savings-withdrawal completions on the liquid tabs', () => {
    expect(HIVE_LAYER_HISTORY_OPS.HIVE).toContain('fill_transfer_from_savings');
    expect(HIVE_LAYER_HISTORY_OPS.HBD).toContain('fill_transfer_from_savings');
  });

  // A power-down installment pays HIVE, so it has to be requested on the HIVE tab and
  // not only on HP.
  it('asks for power-down payouts on both HIVE and HP', () => {
    expect(HIVE_LAYER_HISTORY_OPS.HIVE).toContain('fill_vesting_withdraw');
    expect(HIVE_LAYER_HISTORY_OPS.HP).toContain('fill_vesting_withdraw');
  });
});

describe('matchesAssetTicker', () => {
  it('matches a groomed transfer to its own tab only', () => {
    const activity = { trxIndex: 1, iconType: 'MaterialIcons', value: '10.000 HBD' };
    expect(matchesAssetTicker(activity, 'HBD')).toBe(true);
    expect(matchesAssetTicker(activity, 'HIVE')).toBe(false);
  });

  it('accepts VESTS on the HP tab', () => {
    // delegate_vesting_shares keeps its on-chain VESTS denomination after grooming.
    const activity = { trxIndex: 2, iconType: 'MaterialIcons', value: '1000.000000 VESTS' };
    expect(matchesAssetTicker(activity, 'HP')).toBe(true);
    expect(matchesAssetTicker(activity, 'HIVE')).toBe(false);
  });

  it('rejects an activity with no value', () => {
    expect(matchesAssetTicker(null, 'HIVE')).toBe(false);
    expect(matchesAssetTicker({ trxIndex: 3, iconType: 'MaterialIcons' }, 'HIVE')).toBe(false);
  });

  // A power-up is an HP event even though grooming keeps the HIVE amount that went in,
  // so the ticker alone would drop it from the HP tab.
  it('keeps a power-up on the HP tab and on HIVE', () => {
    const powerUp = {
      trxIndex: 4,
      iconType: 'MaterialIcons',
      textKey: 'transfer_to_vesting',
      value: '10.000 HIVE',
    };
    expect(matchesAssetTicker(powerUp, 'HP')).toBe(true);
    expect(matchesAssetTicker(powerUp, 'HIVE')).toBe(true);
    expect(matchesAssetTicker(powerUp, 'HBD')).toBe(false);
  });

  // A power-down installment pays HIVE; the routed-to-vesting variant pays VESTS.
  it('routes each power-down payout to the tab matching its denomination', () => {
    const liquid = {
      trxIndex: 5,
      iconType: 'MaterialIcons',
      textKey: 'fill_vesting_withdraw',
      value: '5.000 HIVE',
    };
    const routed = { ...liquid, trxIndex: 6, value: '1000.000000 VESTS' };

    expect(matchesAssetTicker(liquid, 'HIVE')).toBe(true);
    expect(matchesAssetTicker(liquid, 'HP')).toBe(false);
    expect(matchesAssetTicker(routed, 'HP')).toBe(true);
    expect(matchesAssetTicker(routed, 'HIVE')).toBe(false);
  });
});

describe('wallet history pipeline', () => {
  // Shape of a real condenser_api.get_account_history page after the SDK normalises it.
  const witnessPage = [
    { num: 10, type: 'producer_reward', timestamp: '2026-08-11T06:00:00', vesting_shares: '5.0' },
    {
      num: 11,
      type: 'curation_reward',
      timestamp: '2026-08-11T06:01:00',
      reward: '1000.000000 VESTS',
      comment_author: 'alice',
      comment_permlink: 'p',
    },
    {
      num: 12,
      type: 'transfer',
      timestamp: '2026-08-11T06:02:00',
      amount: '3.000 HIVE',
      from: 'alice',
      to: 'bob',
      memo: '',
    },
    {
      num: 13,
      type: 'transfer',
      timestamp: '2026-08-11T06:03:00',
      amount: '7.000 HBD',
      from: 'bob',
      to: 'alice',
      memo: '',
    },
    {
      num: 14,
      type: 'delegate_vesting_shares',
      timestamp: '2026-08-11T06:04:00',
      delegator: 'alice',
      delegatee: 'bob',
      vesting_shares: '1000.000000 VESTS',
    },
  ];

  const render = (symbol: string, page: any[] = witnessPage) =>
    orderChainActivities(
      page
        .filter((tx) => transferTypes.includes(tx.type))
        .map((tx) => groomingTransactionData(tx, hivePerMVests))
        .filter((activity): activity is NonNullable<typeof activity> =>
          matchesAssetTicker(activity, symbol),
        ),
    );

  it('renders rows on the HIVE and HBD tabs', () => {
    expect(render('HIVE')).toHaveLength(1);
    expect(render('HBD')).toHaveLength(1);
  });

  it('keeps VESTS-denominated rows on the HP tab', () => {
    const hp = render('HP');
    expect(hp.map((activity) => activity!.textKey)).toEqual(
      expect.arrayContaining(['curation_reward', 'delegate_vesting_shares']),
    );
  });

  it('drops producer_reward everywhere', () => {
    ['HIVE', 'HBD', 'HP'].forEach((symbol) => {
      expect(render(symbol).map((activity) => activity!.textKey)).not.toContain('producer_reward');
    });
  });

  // The reported bug: the app showed two-day-old transfers above today's and read as a
  // wallet that had stopped updating. A page arrives oldest-first and the next page is an
  // older window appended after it, so the raw stream is old->new, then older->newer.
  it('renders the newest operation first across a page boundary', () => {
    const newestWindow = [
      { num: 20, type: 'transfer', timestamp: '2026-08-15T15:07:48', amount: '0.002 HIVE' },
      { num: 21, type: 'transfer', timestamp: '2026-08-16T21:02:48', amount: '20.000 HIVE' },
      { num: 22, type: 'transfer', timestamp: '2026-08-17T03:30:27', amount: '0.016 HIVE' },
    ];
    const olderWindow = [
      { num: 17, type: 'transfer', timestamp: '2026-08-13T09:00:00', amount: '1.000 HIVE' },
      { num: 18, type: 'transfer', timestamp: '2026-08-14T09:00:00', amount: '2.000 HIVE' },
      { num: 19, type: 'transfer', timestamp: '2026-08-15T09:00:00', amount: '3.000 HIVE' },
    ];

    const rows = render('HIVE', [...newestWindow, ...olderWindow]);

    expect(rows.map((activity) => activity!.trxIndex)).toEqual([22, 21, 20, 19, 18, 17]);
  });
});

describe('orderChainActivities', () => {
  const activity = (trxIndex: number, value = '1.000 HIVE') => ({
    trxIndex,
    iconType: 'MaterialIcons',
    value,
  });

  it('collapses a repeated operation to one row', () => {
    const rows = orderChainActivities([activity(5), activity(4), activity(5)]);

    expect(rows.map((row) => row.trxIndex)).toEqual([5, 4]);
  });

  it('leaves the caller its own array', () => {
    const input = [activity(1), activity(3)];
    orderChainActivities(input);

    expect(input.map((row) => row.trxIndex)).toEqual([1, 3]);
  });

  it('handles an empty history', () => {
    expect(orderChainActivities([])).toEqual([]);
  });

  // Dropping a row is the failure this function exists to prevent, so a row that arrives
  // without a usable num must survive rather than collide with every other such row on a
  // single undefined key.
  it('keeps rows that have no usable trxIndex', () => {
    const rows = orderChainActivities([
      { trxIndex: undefined as any, iconType: 'MaterialIcons', value: '1.000 HIVE' },
      activity(7),
      { trxIndex: NaN, iconType: 'MaterialIcons', value: '2.000 HIVE' },
      activity(9),
    ]);

    expect(rows).toHaveLength(4);
    expect(rows.slice(0, 2).map((row) => row.trxIndex)).toEqual([9, 7]);
  });

  it('orders unkeyed rows among themselves by timestamp', () => {
    const older = {
      trxIndex: undefined as any,
      iconType: 'MaterialIcons',
      value: '1.000 HIVE',
      created: '2026-08-15T10:00:00',
    };
    const newer = { ...older, value: '2.000 HIVE', created: '2026-08-17T10:00:00' };

    const rows = orderChainActivities([older, newer]);

    expect(rows.map((row) => row.created)).toEqual([newer.created, older.created]);
  });
});
