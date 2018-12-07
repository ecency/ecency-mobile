import React, { Component, Fragment } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Constants

// Components
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';
import { Transaction } from '../../transaction';
import { WalletDetailsPlaceHolder, WalletUnclaimedPlaceHolder } from '../../basicUIElements';

// Styles
import styles from './walletStyles';

class WalletView extends Component {
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
        ? ` ${Math.round(walletData.rewardSbdBalance * 1000) / 1000} SDB`
        : ''}
      {walletData.rewardVestingSteem
        ? ` ${Math.round(walletData.rewardVestingSteem * 1000) / 1000} SP`
        : ''}
    </Text>
  );

  render() {
    const {
      walletData, intl, selectedUsername, currentAccountUsername,
    } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          {!walletData ? (
            <Fragment>
              <WalletUnclaimedPlaceHolder />
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
                  style={{ marginBottom: 0 }}
                >
                  {currentAccountUsername === selectedUsername ? (
                    <MainButton
                      style={styles.mainButton}
                      height={50}
                      onPress={this._handleOnPressLogin}
                    >
                      <View style={styles.mainButtonWrapper}>
                        {this._getUnclaimedText(walletData)}
                        <View style={styles.mainIconWrapper}>
                          <Ionicons name="md-add" color="#357ce6" size={23} />
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
                <WalletDetails intl={intl} walletData={walletData} />
              </CollapsibleCard>

              <CollapsibleCard
                titleColor="#788187"
                title={intl.formatMessage({
                  id: 'profile.wallet_details',
                })}
                expanded
              >
                <WalletDetails intl={intl} walletData={walletData} />
              </CollapsibleCard>
              <Transaction intl={intl} walletData={walletData} />
            </Fragment>
          )}
        </ScrollView>
      </View>
    );
  }
}

export default WalletView;
