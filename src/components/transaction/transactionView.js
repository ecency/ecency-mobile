/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { useIntl } from 'react-intl';
import { View, Text, FlatList } from 'react-native';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

// Utilities
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem, ListPlaceHolder } from '../basicUIElements';
import { CollapsibleCard } from '..';

import globalStyles from '../../globalStyles';

const TransactionView = ({ transactions, groomingTransactionData, type }) => {
  const intl = useIntl();

  const _renderLoading = () => {
    if (isEmpty(transactions)) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.subText}>{intl.formatMessage({ id: 'points.no_activity' })}</Text>
    );
  };

  const _renderItem = (item, index) => {
    const transactionData = groomingTransactionData(item);

    return (
      <CollapsibleCard
        key={transactionData.created.toString()}
        noBorder
        noContainer
        titleComponent={
          <WalletLineItem
            key={transactionData.created.toString()}
            index={index + 1}
            text={intl.formatMessage({
              id: `${type}.${get(transactionData, 'textKey')}`,
            })}
            description={getTimeFromNow(get(transactionData, 'created'))}
            isCircleIcon
            isThin
            circleIconColor="white"
            isBlackText
            iconName={get(transactionData, 'icon')}
            iconType={get(transactionData, 'iconType')}
            rightText={get(transactionData, 'value', '').trim()}
          />
        }
      >
        {(get(transactionData, 'details') || get(transactionData, 'memo')) && (
          <WalletLineItem
            key={index.toString()}
            text={get(transactionData, 'details', '')}
            isBlackText
            isThin
            description={get(transactionData, 'memo')}
          />
        )}
      </CollapsibleCard>
    );
  };

  return (
    <View style={globalStyles.listWrapper}>
      <FlatList
        data={transactions}
        ListEmptyComponent={_renderLoading()}
        renderItem={({ item, index }) => _renderItem(item, index)}
      />
    </View>
  );
};

export default TransactionView;
