import React from 'react';
import { View } from 'react-native';

// Components
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';

// Utilities
import { vestsToHp } from '../../../utils/conversions';

// Styles
import styles from './walletDetailsStyles';

const WalletDetailsView = ({ walletData, intl, navigate, isShowDropdowns }) => {
  const hiveDropdown = [
    'purchase_estm',
    'transfer_token',
    'transfer_to_savings',
    'transfer_to_vesting',
  ];
  const hbdDropdown = ['purchase_estm', 'transfer_token', 'transfer_to_savings', 'convert'];
  const savingHiveDropdown = ['withdraw_hive'];
  const savingHbdDropdown = ['withdraw_hbd'];
  const hivePowerDropdown = ['delegate', 'power_down'];

  return (
    <View style={styles.container}>
      <WalletLineItem
        text="Hive"
        isBlackText
        iconName="information-circle-outline"
        rightText={`${Math.round(walletData.balance * 1000) / 1000} HIVE`}
        isBoldText
        isHasdropdown={isShowDropdowns}
        dropdownOptions={hiveDropdown.map((item) => intl.formatMessage({ id: `transfer.${item}` }))}
        onDropdownSelect={(index) => navigate(hiveDropdown[index], 'HIVE')}
      />
      <GrayWrapper isGray>
        <WalletLineItem
          text={intl.formatMessage({
            id: 'profile.hive_power',
          })}
          isBlackText
          iconName="information-circle-outline"
          rightText={`${
            Math.round(vestsToHp(walletData.vestingShares, walletData.hivePerMVests) * 1000) / 1000
          } HP`}
          isBoldText
          isHasdropdown={isShowDropdowns}
          dropdownOptions={hivePowerDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(hivePowerDropdown[a], 'HIVE_POWER')}
        />

        {walletData.vestingSharesDelegated > 0 && (
          <WalletLineItem
            rightText={`- ${
              Math.round(
                vestsToHp(walletData.vestingSharesDelegated, walletData.hivePerMVests) * 1000,
              ) / 1000
            } HP`}
            style={styles.walletLineDetail}
          />
        )}
        {walletData.vestingSharesReceived > 0 && (
          <WalletLineItem
            rightText={`+ ${
              Math.round(
                vestsToHp(walletData.vestingSharesReceived, walletData.hivePerMVests) * 1000,
              ) / 1000
            } HP`}
            style={styles.walletLineDetail}
          />
        )}
        {(walletData.vestingSharesDelegated > 0 || walletData.vestingSharesReceived > 0) && (
          <WalletLineItem
            rightText={`= ${
              Math.round(
                vestsToHp(walletData.vestingSharesTotal, walletData.hivePerMVests) * 1000,
              ) / 1000
            } HP`}
            rightTextColor="#357ce6"
            style={styles.walletLineDetail}
          />
        )}
      </GrayWrapper>

      <WalletLineItem
        text={intl.formatMessage({
          id: 'profile.hive_dollars',
        })}
        isBlackText
        iconName="information-circle-outline"
        rightText={`$${Math.round(walletData.hbdBalance * 1000) / 1000}`}
        isBoldText
        isHasdropdown={isShowDropdowns}
        dropdownOptions={hbdDropdown.map((item) => intl.formatMessage({ id: `transfer.${item}` }))}
        onDropdownSelect={(a) => navigate(hbdDropdown[a], 'HBD')}
      />
      <GrayWrapper isGray>
        <WalletLineItem
          text={intl.formatMessage({
            id: 'profile.savings',
          })}
          isBlackText
          iconName="information-circle-outline"
          rightText={`${Math.round(walletData.savingBalance * 1000) / 1000} HIVE`}
          isBoldText
          isHasdropdown={isShowDropdowns}
          dropdownOptions={savingHiveDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(savingHiveDropdown[a], 'SAVING_HIVE')}
        />
        <WalletLineItem
          rightText={`$${Math.round(walletData.savingBalanceHbd * 1000) / 1000}`}
          style={styles.walletLineDetail}
          isHasdropdown={isShowDropdowns}
          dropdownOptions={savingHbdDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(savingHbdDropdown[a], 'SAVING_HBD')}
        />
      </GrayWrapper>
      {walletData.showPowerDown && (
        <WalletLineItem
          text={`${intl.formatMessage({
            id: 'profile.next_power_text',
          })} ${walletData.nextVestingWithdrawal} ${intl.formatMessage({
            id: 'profile.hours',
          })}`}
          textColor="#788187"
          iconName="information-circle-outline"
        />
      )}
    </View>
  );
};

export default WalletDetailsView;
