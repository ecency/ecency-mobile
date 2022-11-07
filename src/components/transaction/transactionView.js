/* eslint-disable react/jsx-wrap-multilines */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Utilities
import { View as AnimatedView } from 'react-native-animatable';
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem } from '../basicUIElements';

const TransactionView = ({ item, index }) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(true);

  const _cardHeader = (
    <WalletLineItem
      key={`keyt-${item.created.toString()}`}
      index={index + 1}
      text={intl.formatMessage({
        id: `wallet.${get(item, 'textKey')}`,
      })}
      description={
        (item.expires ? `${intl.formatMessage({ id: 'wallet.expires' })} ` : '') +
        getTimeFromNow(item.expires || item.created)
      }
      isCircleIcon
      isThin
      circleIconColor="white"
      isBlackText
      iconName={get(item, 'icon')}
      iconType={get(item, 'iconType')}
      rightText={get(item, 'value', '').trim()}
      onPress={() => {
        setCollapsed(!collapsed);
      }}
    />
  );

  const _cardBody = (get(item, 'details') || get(item, 'memo')) && !collapsed && (
    <AnimatedView animation="slideInLeft" duration={200}>
      <WalletLineItem
        key={`keyd-${item.created.toString()}`}
        text={get(item, 'details', '')}
        isBlackText
        isThin
        description={get(item, 'memo')}
      />
    </AnimatedView>
  );

  return (
    <>
      {_cardHeader}
      {_cardBody}
    </>
  );
};

export default TransactionView;
/* eslint-enable */
