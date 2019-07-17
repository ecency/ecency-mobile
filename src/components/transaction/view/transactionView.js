/* eslint-disable react/jsx-wrap-multilines */
import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { View } from 'react-native';
import get from 'lodash/get';

// Utilities
import { groomingTransactionData } from '../../../utils/wallet';
import { getTimeFromNow } from '../../../utils/time';

// Components
// import { FilterBar } from '../../filterBar';
import { WalletLineItem, Card } from '../../basicUIElements';
import { CollapsibleCard } from '../../collapsibleCard';

import styles from './transactionStyles';

class TransactionView extends PureComponent {
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
  // _handleOnDropdownSelect = () => {};

  render() {
    const {
      walletData: { transactions },
      intl,
      intl: { formatNumber },
      steemPerMVests,
    } = this.props;

    return (
      <View style={styles.container}>
        {/* this feature not implemented yet */}
        {/* <FilterBar
          dropdownIconName="arrow-drop-down"
          options={['ALL TRANSACTIONS', 'VOTES', 'REPLIES']}
          defaultText="ALL TRANSACTIONS"
          onDropdownSelect={() => this._handleOnDropdownSelect()}
          rightIconName="ios-lock"
          iconSize={16}
        /> */}
        <Card>
          {transactions &&
            transactions.map((item, index) => {
              const transactionData = groomingTransactionData(item, steemPerMVests, formatNumber);
              if (transactionData.length === 0) return null;

              const value = transactionData.value.split(' ');

              return (
                <CollapsibleCard
                  noBorder
                  noContainer
                  key={transactionData.transDate.toString()}
                  titleComponent={
                    <WalletLineItem
                      key={transactionData.transDate.toString()}
                      index={index}
                      text={intl.formatMessage({
                        id: `wallet.${transactionData.opName}`,
                      })}
                      // description={intl.formatRelative(transactionData.transDate)}
                      description={getTimeFromNow(get(transactionData, 'transDate'))}
                      isCircleIcon
                      isThin
                      circleIconColor="white"
                      isBlackText
                      iconName={transactionData.icon}
                      iconType="MaterialIcons"
                      rightText={`${Math.round(value[0] * 1000) / 1000} ${value[1]}`}
                    />
                  }
                >
                  {(get(transactionData, 'details') || get(transactionData, 'memo')) && (
                    <WalletLineItem
                      key={index.toString()}
                      text={get(transactionData, 'details', 'pipi')}
                      isBlackText
                      isThin
                      description={get(transactionData, 'memo')}
                    />
                  )}
                </CollapsibleCard>
              );
            })}
        </Card>
      </View>
    );
  }
}

export default injectIntl(TransactionView);
