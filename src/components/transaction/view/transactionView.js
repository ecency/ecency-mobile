import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { View } from 'react-native';

// Utilities
import { groomingTransactionData } from '../../../utils/wallet';

// Utils
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
  _handleOnDropdownSelect = () => {};

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
          {transactions
            && transactions.map((item, index) => {
              const transactionData = groomingTransactionData(item, steemPerMVests, formatNumber);

              return (
                <CollapsibleCard
                  noBorder
                  noContainer
                  key={index.toString()}
                  titleComponent={(
                    <WalletLineItem
                      key={index.toString()}
                      index={index}
                      text={intl.formatMessage({
                        id: `wallet.${transactionData.opName}`,
                      })}
                      // description={intl.formatRelative(transactionData.transDate)}
                      description={getTimeFromNow(transactionData.transDate)}
                      isCircleIcon
                      isThin
                      circleIconColor="white"
                      isBlackText
                      iconName={transactionData.icon}
                      iconType="MaterialIcons"
                      rightText={transactionData.value}
                    />
)}
                >
                  {(!!transactionData.details || !!transactionData.memo) && (
                    <WalletLineItem
                      key={index.toString()}
                      text={!!transactionData.details && transactionData.details}
                      isBlackText
                      isThin
                      description={!!transactionData.memo && transactionData.memo}
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
