import React, { Component } from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Constants

// Components
import { MainButton } from '../../mainButton';
import { CollapsibleCard } from '../../collapsibleCard';
import { WalletDetails } from '../../walletDetails';

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
    // const {} = this.props;

    return (
      <View style={styles.container}>
        <CollapsibleCard
          titleColor="#788187"
          isBoldTitle
          fontSize={16}
          defaultTitle="Unclaimed rewards"
          expanded
        >
          <MainButton style={styles.mainButton} height={50} onPress={this._handleOnPressLogin}>
            <View style={styles.mainButtonWrapper}>
              <Text style={styles.mainButtonText}>18.323 STEEM 1.916 SBD 150.167 SP</Text>
              <View style={styles.mainIconWrapper}>
                <Ionicons name="md-add" color="#357ce6" size={23} />
              </View>
            </View>
          </MainButton>
        </CollapsibleCard>

        <CollapsibleCard titleColor="#788187" title="Wallet Details" expanded>
          <WalletDetails />
        </CollapsibleCard>
      </View>
    );
  }
}

export default WalletView;
