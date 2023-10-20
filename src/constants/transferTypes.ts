const TransferTypes = {
  TRANSFER_TOKEN: 'transfer_token',
  PURCHASE_ESTM: 'purchase_estm',
  CONVERT: 'convert',
  TRANSFER_TO_SAVINGS: 'transfer_to_savings',
  TRANSFER_TO_VESTING: 'transfer_to_vesting',
  POINTS: 'points',
  WITHDRAW_HIVE: 'withdraw_hive',
  WITHDRAW_HBD: 'withdraw_hbd',
  SWAP_TOKEN: 'swap_token',
  DELEGATE: 'delegate',
  POWER_DOWN: 'power_down',
  ADDRESS_VIEW: 'address_view',
  DELEGATE_VESTING_SHARES: 'delegate_vesting_shares',

  // Engine Transfer types
  WITHDRAW_VESTING: 'withdraw_vesting',
  TRANSFER_ENGINE: 'transfer_engine',
  UNSTAKE_ENGINE: 'unstake_engine',
  STAKE_ENGINE: 'stake_engine',
  UNDELEGATE_ENGINE: 'undelegate_engine',
  DELEGATE_ENGINE: 'delegate_engine',

  // SPK Transfer Types
  TRANSFER_SPK: 'transfer_spk',
  TRANSFER_LARYNX: 'transfer_larynx_spk',
  POWER_UP_SPK: 'power_up_spk',
  LOCK_LIQUIDITY_SPK: 'lock_liquidity_spk',
  DELEGATE_SPK: 'delegate_spk',
  POWER_DOWN_SPK: 'power_down_spk',
};

export default TransferTypes;
