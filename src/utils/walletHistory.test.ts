import { utils as hiveTxUtils } from '@ecency/sdk/hive';
import {
  HIVE_LAYER_HISTORY_OPS,
  getHistoryOpsForSymbol,
  getNextHistoryPageParam,
  matchesAssetTicker,
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
});

describe('getNextHistoryPageParam', () => {
  // condenser_api.get_account_history returns a page in ASCENDING num order, so index 0
  // is the older edge. Reading the last element instead advances one op per page.
  const ascendingPage = [{ num: 8842005 }, { num: 8842006 }, { num: 8842054 }];

  it('walks backwards from the oldest row on the page', () => {
    expect(getNextHistoryPageParam(ascendingPage)).toBe(8842004);
  });

  it('stops at the start of history instead of returning the -1 newest sentinel', () => {
    expect(getNextHistoryPageParam([{ num: 0 }, { num: 1 }])).toBeUndefined();
  });

  it('stops on an empty or missing page', () => {
    expect(getNextHistoryPageParam([])).toBeUndefined();
    expect(getNextHistoryPageParam(undefined)).toBeUndefined();
  });

  it('stops rather than looping when num is unusable', () => {
    expect(getNextHistoryPageParam([{ num: 'not-a-number' }])).toBeUndefined();
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

  const render = (symbol: string) =>
    witnessPage
      .filter((tx) => transferTypes.includes(tx.type))
      .map((tx) => groomingTransactionData(tx, hivePerMVests))
      .filter((activity) => matchesAssetTicker(activity, symbol));

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
});
