import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Constants

// Components
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';
import { Transaction } from '../../transaction';

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

  render() {
    const { user, walletData } = this.props;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <CollapsibleCard
            titleColor="#788187"
            isBoldTitle
            fontSize={16}
            defaultTitle="Unclaimed rewards"
            expanded
          >
            <MainButton style={styles.mainButton} height={50} onPress={this._handleOnPressLogin}>
              <View style={styles.mainButtonWrapper}>
                <Text style={styles.mainButtonText}>
                  {walletData.rewardSteemBalance ? `${walletData.rewardSteemBalance} STEEM` : ''}
                  {walletData.rewardSbdBalance ? ` ${walletData.rewardSbdBalance} SDB` : ''}
                  {walletData.rewardVestingSteem ? ` ${walletData.rewardVestingSteem} SP` : ''}
                </Text>
                <View style={styles.mainIconWrapper}>
                  <Ionicons name="md-add" color="#357ce6" size={23} />
                </View>
              </View>
            </MainButton>
          </CollapsibleCard>

          <CollapsibleCard titleColor="#788187" title="Wallet Details" expanded>
            <WalletDetails walletData={walletData} />
          </CollapsibleCard>
        </ScrollView>
      </View>
    );
  }
}

export default WalletView;
