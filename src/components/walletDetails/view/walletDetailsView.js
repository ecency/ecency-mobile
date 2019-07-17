import React, { PureComponent } from 'react';
import { View } from 'react-native';

// Components
import { GrayWrapper, WalletLineItem } from '../../basicUIElements';

// Utilities
import { vestsToSp } from '../../../utils/conversions';

// Styles
import styles from './walletDetailsStyles';

class WalletDetailsView extends PureComponent {
  // Component Life Cycles

  // Component Functions

  render() {
    const { walletData, intl, navigate, isShowDropdowns } = this.props;

    const steemDropdown = ['transfer_token', 'transfer_to_saving', 'powerUp'];
    const sbdDropdown = ['transfer_token', 'transfer_to_saving'];
    const savingSteemDropdown = ['withdraw_steem'];
    const savingSbdDropdown = ['withdraw_sbd'];
    const steemPowerDropdown = ['delegate', 'power_down'];

    return (
      <View style={styles.container}>
        <WalletLineItem
          text="Steem"
          isBlackText
          iconName="ios-information-circle-outline"
          rightText={`${Math.round(walletData.balance * 1000) / 1000} STEEM`}
          isBoldText
          isHasdropdown={isShowDropdowns}
          dropdownOptions={steemDropdown.map(item =>
            intl.formatMessage({ id: `transfer.${item}` }),
          )}
          onDropdownSelect={index => navigate(steemDropdown[index], 'STEEM')}
        />
        <GrayWrapper isGray>
          <WalletLineItem
            text={intl.formatMessage({
              id: 'profile.steem_power',
            })}
            isBlackText
            iconName="ios-information-circle-outline"
            rightText={`${Math.round(
              vestsToSp(walletData.vestingShares, walletData.steemPerMVests) * 1000,
            ) / 1000} SP`}
            isBoldText
            isHasdropdown={isShowDropdowns}
            dropdownOptions={steemPowerDropdown.map(item =>
              intl.formatMessage({ id: `transfer.${item}` }),
            )}
            onDropdownSelect={a => navigate(steemPowerDropdown[a], 'STEEM_POWER')}
          />

          {walletData.vestingSharesDelegated > 0 && (
            <WalletLineItem
              rightText={`- ${Math.round(
                vestsToSp(walletData.vestingSharesDelegated, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
              style={styles.walletLineDetail}
            />
          )}
          {walletData.vestingSharesReceived > 0 && (
            <WalletLineItem
              rightText={`+ ${Math.round(
                vestsToSp(walletData.vestingSharesReceived, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
              style={styles.walletLineDetail}
            />
          )}
          {(walletData.vestingSharesDelegated > 0 || walletData.vestingSharesReceived > 0) && (
            <WalletLineItem
              rightText={`= ${Math.round(
                vestsToSp(walletData.vestingSharesTotal, walletData.steemPerMVests) * 1000,
              ) / 1000} SP`}
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
          dropdownOptions={sbdDropdown.map(item => intl.formatMessage({ id: `transfer.${item}` }))}
          onDropdownSelect={a => navigate(sbdDropdown[a], 'SBD')}
        />
        <GrayWrapper isGray>
          <WalletLineItem
            text={intl.formatMessage({
              id: 'profile.savings',
            })}
            isBlackText
            iconName="ios-information-circle-outline"
            rightText={`${Math.round(walletData.savingBalance * 1000) / 1000} STEEM`}
            isBoldText
            isHasdropdown={isShowDropdowns}
            dropdownOptions={savingSteemDropdown.map(item =>
              intl.formatMessage({ id: `transfer.${item}` }),
            )}
            onDropdownSelect={a => navigate(savingSteemDropdown[a], 'SAVING_STEEM')}
          />
          <WalletLineItem
            rightText={`$${Math.round(walletData.savingBalanceSbd * 1000) / 1000}`}
            style={styles.walletLineDetail}
            isHasdropdown={isShowDropdowns}
            dropdownOptions={savingSbdDropdown.map(item =>
              intl.formatMessage({ id: `transfer.${item}` }),
            )}
            onDropdownSelect={a => navigate(savingSbdDropdown[a], 'SAVING_SBD')}
          />
        </GrayWrapper>
        {walletData.showPowerDown && (
          <WalletLineItem
            text={`${intl.formatMessage({
              id: 'profile.next_power_text',
            })} ${walletData.nextVestingWithdrawal} ${intl.formatMessage({
              id: 'profile.day',
            })}`}
            textColor="#788187"
            iconName="ios-information-circle-outline"
          />
        )}
      </View>
    );
  }
}

export default WalletDetailsView;
