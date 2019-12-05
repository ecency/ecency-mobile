/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import { useIntl } from 'react-intl';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import get from 'lodash/get';

// Utilities
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem, ListPlaceHolder } from '../basicUIElements';
import { CollapsibleCard } from '..';
import { ThemeContainer } from '../../containers';

import globalStyles from '../../globalStyles';

const TransactionView = ({ transactions, type, refreshing, setRefreshing, isLoading }) => {
  const intl = useIntl();

  const _renderLoading = () => {
    if (isLoading) {
      return <ListPlaceHolder />;
    }

    return (
      <Text style={globalStyles.hintText}>{intl.formatMessage({ id: 'wallet.no_activity' })}</Text>
    );
  };

  const refreshControl = () => (
    <ThemeContainer>
      {isDarkTheme => (
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => setRefreshing(true)}
          progressBackgroundColor="#357CE6"
          tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
          titleColor="#fff"
          colors={['#fff']}
        />
      )}
    </ThemeContainer>
  );

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
        style={globalStyles.tabBarBottom}
        ListEmptyComponent={_renderLoading()}
        onRefresh={refreshControl}
        refreshing={refreshing}
        renderItem={({ item, index }) => _renderItem(item, index)}
      />
    </View>
  );
};

export default TransactionView;
/* eslint-enable */
