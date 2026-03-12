import {
  groomingTransactionData,
  groomingEngineHistory,
  groomingPointsTransactionData,
} from './wallet';
import { EngineOperations } from '../providers/hive-engine/hiveEngine.types';

describe('groomingTransactionData', () => {
  const hivePerMVests = 500;

  it('returns null for null/undefined input', () => {
    expect(groomingTransactionData(null, hivePerMVests)).toBeNull();
    expect(groomingTransactionData(undefined, hivePerMVests)).toBeNull();
  });

  describe('modern object format', () => {
    it('parses curation_reward', () => {
      const tx = {
        type: 'curation_reward',
        timestamp: '2024-01-01T00:00:00',
        num: 1,
        reward: '1000.000000 VESTS',
        comment_author: 'alice',
        comment_permlink: 'my-post',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result).not.toBeNull();
      expect(result!.textKey).toBe('curation_reward');
      expect(result!.value).toContain('HP');
      expect(result!.details).toBe('@alice/my-post');
      expect(result!.trxIndex).toBe(1);
    });

    it('parses transfer', () => {
      const tx = {
        type: 'transfer',
        timestamp: '2024-01-01T00:00:00',
        num: 2,
        amount: '10.000 HIVE',
        memo: 'test memo',
        from: 'alice',
        to: 'bob',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('transfer');
      expect(result!.value).toBe('10.000 HIVE');
      expect(result!.icon).toBe('compare-arrows');
      expect(result!.details).toBe('@alice to @bob');
      expect(result!.sender).toBe('alice');
      expect(result!.receiver).toBe('bob');
      expect(result!.memo).toBe('test memo');
    });

    it('parses transfer_to_savings', () => {
      const tx = {
        type: 'transfer_to_savings',
        timestamp: '2024-01-01T00:00:00',
        num: 3,
        amount: '5.000 HBD',
        memo: '',
        from: 'alice',
        to: 'alice',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('transfer_to_savings');
      expect(result!.value).toBe('5.000 HBD');
    });

    it('parses author_reward', () => {
      const tx = {
        type: 'author_reward',
        timestamp: '2024-01-01T00:00:00',
        num: 4,
        hbd_payout: '1.000 HBD',
        hive_payout: '0.000 HIVE',
        vesting_payout: '500.000000 VESTS',
        author: 'alice',
        permlink: 'my-post',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('author_reward');
      expect(result!.details).toBe('@alice/my-post');
      expect(result!.value).toContain('HBD');
    });

    it('parses claim_reward_balance', () => {
      const tx = {
        type: 'claim_reward_balance',
        timestamp: '2024-01-01T00:00:00',
        num: 5,
        reward_hbd: '0.500 HBD',
        reward_hive: '1.000 HIVE',
        reward_vests: '100.000000 VESTS',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('claim_reward_balance');
      expect(result!.value).toBeDefined();
    });

    it('parses withdraw_vesting', () => {
      const tx = {
        type: 'withdraw_vesting',
        timestamp: '2024-01-01T00:00:00',
        num: 6,
        vesting_shares: '10000.000000 VESTS',
        acc: 'alice',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('withdraw_vesting');
      expect(result!.value).toContain('HP');
      expect(result!.icon).toBe('attach-money');
    });

    it('parses fill_order', () => {
      const tx = {
        type: 'fill_order',
        timestamp: '2024-01-01T00:00:00',
        num: 7,
        current_pays: '10.000 HIVE',
        open_pays: '5.000 HBD',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('10.000 HIVE = 5.000 HBD');
      expect(result!.icon).toBe('reorder');
    });

    it('parses escrow_transfer', () => {
      const tx = {
        type: 'escrow_transfer',
        timestamp: '2024-01-01T00:00:00',
        num: 8,
        agent: 'escrow-agent',
        escrow_id: 12345,
        from: 'alice',
        to: 'bob',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('12345');
      expect(result!.icon).toBe('wb-iridescent');
      expect(result!.details).toBe('@alice to @bob');
      expect(result!.memo).toBe('escrow-agent');
    });

    it('parses delegate_vesting_shares', () => {
      const tx = {
        type: 'delegate_vesting_shares',
        timestamp: '2024-01-01T00:00:00',
        num: 9,
        delegator: 'alice',
        delegatee: 'bob',
        vesting_shares: '50000.000000 VESTS',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('50000.000000 VESTS');
      expect(result!.icon).toBe('change-history');
      expect(result!.details).toBe('@alice to @bob');
    });

    it('parses cancel_transfer_from_savings', () => {
      const tx = {
        type: 'cancel_transfer_from_savings',
        timestamp: '2024-01-01T00:00:00',
        num: 10,
        from: 'alice',
        request_id: 99,
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.icon).toBe('cancel');
      expect(result!.details).toBe('from @alice, id: 99');
    });

    it('parses fill_convert_request', () => {
      const tx = {
        type: 'fill_convert_request',
        timestamp: '2024-01-01T00:00:00',
        num: 11,
        owner: 'alice',
        requestid: 42,
        amount_out: '10.000 HIVE',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('10.000 HIVE');
      expect(result!.icon).toBe('hourglass-full');
    });

    it('parses fill_transfer_from_savings', () => {
      const tx = {
        type: 'fill_transfer_from_savings',
        timestamp: '2024-01-01T00:00:00',
        num: 12,
        from: 'alice',
        to: 'bob',
        amount: '5.000 HBD',
        request_id: 7,
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('5.000 HBD');
      expect(result!.details).toBe('@alice to @bob, id: 7');
    });

    it('parses fill_vesting_withdraw', () => {
      const tx = {
        type: 'fill_vesting_withdraw',
        timestamp: '2024-01-01T00:00:00',
        num: 13,
        from_account: 'alice',
        to_account: 'bob',
        deposited: '10.000 HIVE',
      };
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.value).toBe('10.000 HIVE');
      expect(result!.details).toBe('@alice to bob');
    });

    it('returns null for unknown operation type', () => {
      const tx = {
        type: 'unknown_op',
        timestamp: '2024-01-01T00:00:00',
        num: 99,
      };
      expect(groomingTransactionData(tx, hivePerMVests)).toBeNull();
    });
  });

  describe('legacy array format', () => {
    it('parses transfer from legacy array', () => {
      const tx = [
        42,
        {
          op: [
            'transfer',
            {
              amount: '10.000 HIVE',
              memo: 'hello',
              from: 'alice',
              to: 'bob',
            },
          ],
          timestamp: '2024-01-01T00:00:00',
        },
      ];
      const result = groomingTransactionData(tx, hivePerMVests);
      expect(result!.textKey).toBe('transfer');
      expect(result!.value).toBe('10.000 HIVE');
      expect(result!.trxIndex).toBe(42);
      expect(result!.created).toBe('2024-01-01T00:00:00');
    });
  });

  it('sets repeatable flag for transfer operations', () => {
    const tx = {
      type: 'transfer',
      timestamp: '2024-01-01T00:00:00',
      num: 1,
      amount: '1.000 HIVE',
      from: 'a',
      to: 'b',
    };
    const result = groomingTransactionData(tx, hivePerMVests);
    expect(result!.repeatable).toBe(true);
  });

  it('sets repeatable false for non-transfer operations', () => {
    const tx = {
      type: 'curation_reward',
      timestamp: '2024-01-01T00:00:00',
      num: 1,
      reward: '100.000000 VESTS',
      comment_author: 'a',
      comment_permlink: 'b',
    };
    const result = groomingTransactionData(tx, hivePerMVests);
    expect(result!.repeatable).toBe(false);
  });

  it('defaults hivePerMVests to 0 when falsy', () => {
    const tx = {
      type: 'curation_reward',
      timestamp: '2024-01-01T00:00:00',
      num: 1,
      reward: '1000.000000 VESTS',
      comment_author: 'a',
      comment_permlink: 'b',
    };
    const result = groomingTransactionData(tx, null);
    expect(result).not.toBeNull();
    expect(result!.value).toContain('HP');
  });
});

describe('groomingEngineHistory', () => {
  const baseTx = {
    _id: 'abc123',
    blockNumber: 100,
    transactionId: 'tx1',
    timestamp: 1700000000,
    from: 'alice',
    to: 'bob',
    symbol: 'BEE',
    quantity: 50,
    memo: 'test',
    account: 'alice',
  };

  it('maps basic fields correctly', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_TRANSFER };
    const result = groomingEngineHistory(tx);
    expect(result!.trxIndex).toBe(100);
    expect(result!.textKey).toBe('tokens_transfer');
    expect(result!.value).toBe('50 BEE');
    expect(result!.memo).toBe('test');
    expect(result!.sender).toBe('alice');
    expect(result!.receiver).toBe('bob');
    expect(result!.details).toBe('@alice to @bob');
    expect(result!.engineTrxId).toBe('abc123');
  });

  it('sets compare-arrows icon for transfers', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_TRANSFER };
    expect(groomingEngineHistory(tx)!.icon).toBe('compare-arrows');
  });

  it('sets fiber-new icon for token creation', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_CREATE };
    expect(groomingEngineHistory(tx)!.icon).toBe('fiber-new');
  });

  it('sets change-history icon for staking', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_STAKE };
    expect(groomingEngineHistory(tx)!.icon).toBe('change-history');
  });

  it('sets cancel icon for cancel unstake', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_CANCEL_UNSTAKE };
    expect(groomingEngineHistory(tx)!.icon).toBe('cancel');
  });

  it('sets hourglass icons for done operations', () => {
    const tx1 = { ...baseTx, operation: EngineOperations.TOKENS_UNSTAKE_DONE };
    expect(groomingEngineHistory(tx1)!.icon).toBe('hourglass-full');

    const tx2 = { ...baseTx, operation: EngineOperations.TOKENS_UNSTAKE_START };
    expect(groomingEngineHistory(tx2)!.icon).toBe('hourglass-top');
  });

  it('uses authorperm for details when available', () => {
    const tx = {
      ...baseTx,
      operation: EngineOperations.TOKENS_TRANSFER,
      authorperm: '@alice/my-post',
    };
    expect(groomingEngineHistory(tx)!.details).toBe('@alice/my-post');
  });

  it('converts timestamp to ISO string', () => {
    const tx = { ...baseTx, operation: EngineOperations.TOKENS_TRANSFER };
    const result = groomingEngineHistory(tx);
    expect(result!.created).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('groomingPointsTransactionData', () => {
  it('returns null for null/undefined input', () => {
    expect(groomingPointsTransactionData(null)).toBeNull();
    expect(groomingPointsTransactionData(undefined)).toBeNull();
  });

  it('formats sender details', () => {
    const tx = { id: 1, amount: 100, sender: 'alice', receiver: null };
    const result = groomingPointsTransactionData(tx);
    expect(result!.details).toBe('from @alice');
    expect(result!.value).toBe('100 Points');
    expect(result!.trxIndex).toBe(1);
  });

  it('formats receiver details when no sender', () => {
    const tx = { id: 2, amount: 50, sender: null, receiver: 'bob' };
    const result = groomingPointsTransactionData(tx);
    expect(result!.details).toBe('to @bob');
  });

  it('preserves original transaction fields', () => {
    const tx = { id: 3, amount: 10, sender: null, receiver: null, created: '2024-01-01' };
    const result = groomingPointsTransactionData(tx);
    expect(result!.created).toBe('2024-01-01');
  });
});
