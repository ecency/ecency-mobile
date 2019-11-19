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

const TransactionView = ({ transactions, type }) => {
  const intl = useIntl();

  const _renderLoading = () => {
    if (isEmpty(transactions)) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.subText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
    );
  };

  const _renderItem = (item, index) => {
    return (
      <CollapsibleCard
        key={item.created.toString()}
        noBorder
        noContainer
        titleComponent={
          <WalletLineItem
            key={item.created.toString()}
            index={index + 1}
            text={intl.formatMessage({
              id: `wallet.${get(item, 'textKey')}`,
            })}
            description={getTimeFromNow(get(item, 'created'))}
            isCircleIcon
            isThin
            circleIconColor="white"
            isBlackText
            iconName={get(item, 'icon')}
            iconType={get(item, 'iconType')}
            rightText={get(item, 'value', '').trim()}
          />
        }
      >
        {(get(item, 'details') || get(item, 'memo')) && (
          <WalletLineItem
            key={index.toString()}
            text={get(item, 'details', '')}
            isBlackText
            isThin
            description={get(item, 'memo')}
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
