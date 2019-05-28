import React, { PureComponent, Fragment } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import { Icon } from '../../icon';
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';
import { Transaction } from '../../transaction';
import { WalletDetailsPlaceHolder } from '../../basicUIElements';

// Styles
import styles from './walletStyles';

class WalletView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _getUnclaimedText = (walletData, isPreview) => (
    <Text style={[isPreview ? styles.unclaimedTextPreview : styles.unclaimedText]}>
      {walletData.rewardSteemBalance
        ? `${Math.round(walletData.rewardSteemBalance * 1000) / 1000} STEEM`
        : ''}
      {walletData.rewardSbdBalance
        ? ` ${Math.round(walletData.rewardSbdBalance * 1000) / 1000} SBD`
        : ''}
      {walletData.rewardVestingSteem
        ? ` ${Math.round(walletData.rewardVestingSteem * 1000) / 1000} SP`
        : ''}
    </Text>
  );

  render() {
    const {
      isClaiming,
      claimRewardBalance,
      currentAccountUsername,
      handleOnWalletRefresh,
      intl,
      isRefreshing,
      selectedUsername,
      walletData,
      isDarkTheme,
    } = this.props;

    return (
      <ScrollView
        refreshControl={
          <RefreshControl
  refreshing={isRefreshing}
  onRefresh={handleOnWalletRefresh}
  progressBackgroundColor="#357CE6"
  tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
  titleColor="#fff"
  colors={['#fff']}
/>
        }
        style={styles.scrollView}
      >
        {!walletData ? (
          <Fragment>
            <WalletDetailsPlaceHolder />
          </Fragment>
        ) : (
          <Fragment>
            {walletData.hasUnclaimedRewards && (
              <CollapsibleCard
                titleColor="#788187"
                isBoldTitle
                defaultTitle={intl.formatMessage({
                  id: 'profile.unclaimed_rewards',
                })}
                expanded
              >
                {currentAccountUsername === selectedUsername ? (
                  <MainButton
                    isLoading={isClaiming}
                    isDisable={isClaiming}
                    style={styles.mainButton}
                    height={50}
                    onPress={() => claimRewardBalance()}
                  >
                    <View style={styles.mainButtonWrapper}>
                      {this._getUnclaimedText(walletData)}
                      <View style={styles.mainIconWrapper}>
                        <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                      </View>
                    </View>
                  </MainButton>
                ) : (
                  this._getUnclaimedText(walletData, true)
                )}
              </CollapsibleCard>
            )}
            <CollapsibleCard
              titleColor="#788187"
              title={intl.formatMessage({
                id: 'profile.wallet_details',
              })}
              expanded
            >
              <WalletDetails
                intl={intl}
                walletData={walletData}
                isShowDropdowns={currentAccountUsername === selectedUsername}
              />
            </CollapsibleCard>
            <Transaction walletData={walletData} />
          </Fragment>
        )}
      </ScrollView>
    );
  }
}

export default injectIntl(WalletView);
