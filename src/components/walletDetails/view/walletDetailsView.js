import React from 'react';
import { View } from 'react-native';

// Components
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';

// Utilities
import { vestsToSp } from '../../../utils/conversions';

// Styles
import styles from './walletDetailsStyles';

const WalletDetailsView = ({ walletData, intl, navigate, isShowDropdowns }) => {
  const steemDropdown = ['purchase_estm', 'transfer_token', 'transfer_to_saving', 'powerUp'];
  const sbdDropdown = ['purchase_estm', 'transfer_token', 'transfer_to_saving', 'convert'];
  const savingSteemDropdown = ['withdraw_steem'];
  const savingSbdDropdown = ['withdraw_sbd'];
  const steemPowerDropdown = ['delegate', 'power_down'];

  return (
    <View style={styles.container}>
      <WalletLineItem
        text="Steem"
        isBlackText
        iconName="ios-information-circle-outline"
        rightText={`${Math.round(walletData.balance * 1000) / 1000} HIVE`}
        isBoldText
        isHasdropdown={isShowDropdowns}
        dropdownOptions={steemDropdown.map((item) =>
          intl.formatMessage({ id: `transfer.${item}` }),
        )}
        onDropdownSelect={(index) => navigate(steemDropdown[index], 'HIVE')}
      />
      <GrayWrapper isGray>
        <WalletLineItem
          text={intl.formatMessage({
            id: 'profile.steem_power',
          })}
          isBlackText
          iconName="ios-information-circle-outline"
          rightText={`${
            Math.round(vestsToSp(walletData.vestingShares, walletData.steemPerMVests) * 1000) / 1000
          } HP`}
          isBoldText
          isHasdropdown={isShowDropdowns}
          dropdownOptions={steemPowerDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(steemPowerDropdown[a], 'HIVE_POWER')}
        />

        {walletData.vestingSharesDelegated > 0 && (
          <WalletLineItem
            rightText={`- ${
              Math.round(
                vestsToSp(walletData.vestingSharesDelegated, walletData.steemPerMVests) * 1000,
              ) / 1000
            } HP`}
            style={styles.walletLineDetail}
          />
        )}
        {walletData.vestingSharesReceived > 0 && (
          <WalletLineItem
            rightText={`+ ${
              Math.round(
                vestsToSp(walletData.vestingSharesReceived, walletData.steemPerMVests) * 1000,
              ) / 1000
            } HP`}
            style={styles.walletLineDetail}
          />
        )}
        {(walletData.vestingSharesDelegated > 0 || walletData.vestingSharesReceived > 0) && (
          <WalletLineItem
            rightText={`= ${
              Math.round(
                vestsToSp(walletData.vestingSharesTotal, walletData.steemPerMVests) * 1000,
              ) / 1000
            } HP`}
            rightTextColor="#357ce6"
            style={styles.walletLineDetail}
          />
        )}
      </GrayWrapper>

      <WalletLineItem
        text={intl.formatMessage({
          id: 'profile.steem_dollars',
        })}
        isBlackText
        iconName="ios-information-circle-outline"
        rightText={`$${Math.round(walletData.sbdBalance * 1000) / 1000}`}
        isBoldText
        isHasdropdown={isShowDropdowns}
        dropdownOptions={sbdDropdown.map((item) => intl.formatMessage({ id: `transfer.${item}` }))}
        onDropdownSelect={(a) => navigate(sbdDropdown[a], 'HBD')}
      />
      <GrayWrapper isGray>
        <WalletLineItem
          text={intl.formatMessage({
            id: 'profile.savings',
          })}
          isBlackText
          iconName="ios-information-circle-outline"
          rightText={`${Math.round(walletData.savingBalance * 1000) / 1000} HIVE`}
          isBoldText
          isHasdropdown={isShowDropdowns}
          dropdownOptions={savingSteemDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(savingSteemDropdown[a], 'SAVING_HIVE')}
        />
        <WalletLineItem
          rightText={`$${Math.round(walletData.savingBalanceSbd * 1000) / 1000}`}
          style={styles.walletLineDetail}
          isHasdropdown={isShowDropdowns}
          dropdownOptions={savingSbdDropdown.map((item) =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={(a) => navigate(savingSbdDropdown[a], 'SAVING_HBD')}
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
          iconName="ios-information-circle-outline"
        />
      )}
    </View>
  );
};

export default WalletDetailsView;
