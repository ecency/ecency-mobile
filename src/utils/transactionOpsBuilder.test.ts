// Mock external dependencies
import { buildTransferOpsArray } from './transactionOpsBuilder';
import TransferTypes from '../constants/transferTypes';
import TokenLayers from '../constants/tokenLayers';

jest.mock('../providers/hive-engine/hiveEngineActions', () => ({
  getEngineActionOpArray: jest.fn((...args) => [['engine_op', ...args]]),
}));
jest.mock('../providers/hive/dhive', () => ({
  buildActiveCustomJsonOpArr: jest.fn((from, type, json) => [
    ['custom_json', { from, type, json }],
  ]),
}));
jest.mock('../providers/hive-spk/hiveSpk', () => ({
  getSpkActionJSON: jest.fn((amount, to, memo) => ({ amount, to, memo })),
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

    it('preserves existing decimal precision when >= 3', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        amount: '10.12345',
      });
      expect(ops[0][1].amount).toBe('10.12345 HIVE');
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

    it('routes SPK layer to custom_json', () => {
      const ops = buildTransferOpsArray(TransferTypes.TRANSFER, {
        ...baseData,
        tokenLayer: TokenLayers.SPK,
      });
      expect(ops[0][0]).toBe('custom_json');
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
