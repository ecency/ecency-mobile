// Mock external dependencies
import { buildTransferOpsArray } from './transactionOpsBuilder';
import TransferTypes from '../constants/transferTypes';
import TokenLayers from '../constants/tokenLayers';

jest.mock('../providers/hive-engine/hiveEngineActions', () => ({
  getEngineActionOpArray: jest.fn((...args) => [['engine_op', ...args]]),
}));
jest.mock('../providers/hive/hive', () => ({
  buildActiveCustomJsonOpArr: jest.fn((from, type, json) => [
    ['custom_json', { from, type, json }],
  ]),
}));

describe('buildTransferOpsArray', () => {
  const baseData = {
    from: 'alice',
    to: 'bob',
    amount: '10',
    fundType: 'HIVE',
  };

  describe('decimal normalization', () => {
    it('pads amount to 3 decimal places when fewer', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, { ...baseData, amount: '10' });
      expect(ops[0][1].amount).toBe('10.000 HIVE');
    });

    it('normalizes an over-precise amount down to the asset precision (3 dp for HIVE)', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        amount: '10.12345',
      });
      expect(ops[0][1].amount).toBe('10.123 HIVE');
    });

    it('uses 6 dp for VESTS amounts', () => {
      const ops = buildTransferOpsArray(TransferTypes.DELEGATE_VESTING_SHARES, {
        ...baseData,
        amount: '10',
        fundType: 'VESTS',
      });
      expect(ops[0][1].vesting_shares).toBe('10.000000 VESTS');
    });

    it('does not force engine-token quantities to 3 dp (mock shape: [op, action, from, to, amount, symbol, memo])', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        amount: '10.5',
        tokenLayer: TokenLayers.ENGINE,
      });
      expect(ops[0][4]).toBe('10.5 HIVE');
    });
  });

  // mock shape: ['engine_op', action, from, to, amount, symbol, memo, precision]
  describe('engine token precision', () => {
    const engineBase = {
      from: 'alice',
      to: 'bob',
      fundType: 'ARCHON',
      tokenLayer: TokenLayers.ENGINE,
    };

    it('truncates an over-precise engine amount to the token precision and threads precision through', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...engineBase,
        amount: '10.123456',
        precision: 3,
      });
      expect(ops[0][4]).toBe('10.123 ARCHON');
      expect(ops[0][7]).toBe(3);
    });

    it('supports integer (precision 0) tokens without dropping the 0', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...engineBase,
        amount: '10.9',
        precision: 0,
      });
      expect(ops[0][4]).toBe('10 ARCHON');
      expect(ops[0][7]).toBe(0);
    });

    it('falls back to 8-decimal formatting when precision is unknown', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...engineBase,
        amount: '10.123456789',
      });
      expect(ops[0][4]).toBe('10.12345678 ARCHON');
      expect(ops[0][7]).toBeUndefined();
    });
  });

  describe('TRANSFER', () => {
    it('builds single transfer op', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, baseData);
      expect(ops).toHaveLength(1);
      expect(ops[0][0]).toBe('transfer');
      expect(ops[0][1]).toEqual({
        from: 'alice',
        to: 'bob',
        amount: '10.000 HIVE',
        memo: undefined,
      });
    });

    it('splits multi-recipient transfers by comma', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        to: 'bob, charlie',
      });
      expect(ops).toHaveLength(2);
      expect(ops[0][1].to).toBe('bob');
      expect(ops[1][1].to).toBe('charlie');
    });

    it('splits multi-recipient by space', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, { ...baseData, to: 'bob charlie' });
      expect(ops).toHaveLength(2);
    });

    it('throws for empty recipients', () => {
      expect(() => buildTransferOpsArray(TransferTypes.TRANSFER, { ...baseData, to: '' })).toThrow(
        'No valid recipients',
      );
    });

    it('throws for too many recipients (>50)', () => {
      const many = Array(51).fill('user').join(',');
      expect(() =>
        buildTransferOpsArray(TransferTypes.TRANSFER, { ...baseData, to: many }),
      ).toThrow('Too many recipients');
    });

    it('includes memo when provided', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, { ...baseData, memo: 'thanks' });
      expect(ops[0][1].memo).toBe('thanks');
    });
  });

  describe('CONVERT', () => {
    it('builds convert op with requestid', () => {
      const ops = buildTransferOpsArray(TransferTypes.CONVERT, baseData);
      expect(ops[0][0]).toBe('convert');
      expect(ops[0][1].owner).toBe('alice');
      expect(ops[0][1].amount).toBe('10.000 HIVE');
      expect(typeof ops[0][1].requestid).toBe('number');
    });
  });

  describe('DELEGATE_VESTING_SHARES', () => {
    it('builds delegation op', () => {
      const ops = buildTransferOpsArray(TransferTypes.DELEGATE_VESTING_SHARES, baseData);
      expect(ops[0][0]).toBe('delegate_vesting_shares');
      expect(ops[0][1].delegator).toBe('alice');
      expect(ops[0][1].delegatee).toBe('bob');
      expect(ops[0][1].vesting_shares).toBe('10.000 HIVE');
    });
  });

  describe('TRANSFER_TO_SAVINGS', () => {
    it('builds savings transfer op', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER_TO_SAVINGS, baseData);
      expect(ops[0][0]).toBe('transfer_to_savings');
      expect(ops[0][1].from).toBe('alice');
      expect(ops[0][1].to).toBe('bob');
    });
  });

  describe('TRANSFER_TO_VESTING', () => {
    it('builds power up op (no memo)', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER_TO_VESTING, {
        ...baseData,
        memo: 'ignored',
      });
      expect(ops[0][0]).toBe('transfer_to_vesting');
      expect(ops[0][1].memo).toBeUndefined();
    });
  });

  describe('TRANSFER_FROM_SAVINGS', () => {
    it('builds savings withdrawal with request_id', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER_FROM_SAVINGS, baseData);
      expect(ops[0][0]).toBe('transfer_from_savings');
      expect(typeof ops[0][1].request_id).toBe('number');
    });
  });

  describe('WITHDRAW_VESTING', () => {
    it('builds power down op', () => {
      const ops = buildTransferOpsArray(TransferTypes.WITHDRAW_VESTING, baseData);
      expect(ops[0][0]).toBe('withdraw_vesting');
      expect(ops[0][1].account).toBe('alice');
      expect(ops[0][1].vesting_shares).toBe('10.000 HIVE');
    });
  });

  describe('RECURRENT_TRANSFER', () => {
    it('builds recurrent transfer with recurrence and executions', () => {
      const ops = buildTransferOpsArray(TransferTypes.RECURRENT_TRANSFER, {
        ...baseData,
        recurrence: 24,
        executions: 7,
      });
      expect(ops[0][0]).toBe('recurrent_transfer');
      expect(ops[0][1].recurrence).toBe(24);
      expect(ops[0][1].executions).toBe(7);
      expect(ops[0][1].extensions).toEqual([]);
    });
  });

  describe('unsupported type', () => {
    it('throws for unknown transfer type', () => {
      expect(() => buildTransferOpsArray('unknown_type', baseData)).toThrow(
        'Unsupported transaction type',
      );
    });
  });

  describe('token layers', () => {
    it('routes ENGINE layer to engine action', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        tokenLayer: TokenLayers.ENGINE,
      });
      expect(ops[0][0]).toBe('engine_op');
    });

    it('ENGINE layer TRANSFER splits multi-recipient by comma/space', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        to: 'bob, charlie dave',
        tokenLayer: TokenLayers.ENGINE,
      });
      expect(ops).toHaveLength(3);
      ops.forEach((op) => expect(op[0]).toBe('engine_op'));
      // Mocked engine op shape: ['engine_op', action, from, to, amount, symbol, memo]
      expect(ops.map((op) => op[3])).toEqual(['bob', 'charlie', 'dave']);
    });

    it('ENGINE layer TRANSFER throws for empty recipients', () => {
      expect(() =>
        buildTransferOpsArray(TransferTypes.TRANSFER, {
          ...baseData,
          to: '',
          tokenLayer: TokenLayers.ENGINE,
        }),
      ).toThrow('No valid recipients');
    });

    it('ENGINE layer TRANSFER throws for too many recipients (>50)', () => {
      const many = Array(51).fill('user').join(',');
      expect(() =>
        buildTransferOpsArray(TransferTypes.TRANSFER, {
          ...baseData,
          to: many,
          tokenLayer: TokenLayers.ENGINE,
        }),
      ).toThrow('Too many recipients');
    });

    it('routes POINTS layer ecency transfer to custom_json with multi-recipient', () => {
      const ops = buildTransferOpsArray(TransferTypes.ECENCY_POINT_TRANSFER, {
        ...baseData,
        to: 'bob, charlie',
        tokenLayer: TokenLayers.POINTS,
      });
      expect(ops).toHaveLength(2);
      expect(ops[0][0]).toBe('custom_json');
    });

    it('POINTS layer throws for empty recipients', () => {
      expect(() =>
        buildTransferOpsArray(TransferTypes.ECENCY_POINT_TRANSFER, {
          ...baseData,
          to: '',
          tokenLayer: TokenLayers.POINTS,
        }),
      ).toThrow('No valid recipients');
    });
  });
});
