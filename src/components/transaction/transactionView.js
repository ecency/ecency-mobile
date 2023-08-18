/* eslint-disable react/jsx-wrap-multilines */
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Utilities
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem } from '../basicUIElements';
import { getHumanReadableKeyString } from '../../utils/strings';

const TransactionView = ({ item, index, cancelling, onCancelPress}) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(true);

  const title = !!intl.messages[`wallet.${item.textKey}`] ? 
    intl.formatMessage({
      id: `wallet.${item.textKey}`,
    })
    :
    getHumanReadableKeyString(item.textKey)


  const _cardHeader = (
    <WalletLineItem
      key={`keyt-${item.created.toString()}`}
      index={index + 1}
      text={title}
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
      cancelable={item.cancelable}
      cancelling={cancelling}
      onCancelPress={onCancelPress}

    />
  );

  const _cardBody = (get(item, 'details') || get(item, 'memo')) && !collapsed && (
    <Animated.View entering={SlideInLeft.duration(200)}>
      <WalletLineItem
        key={`keyd-${item.created.toString()}`}
        text={get(item, 'details', '')}
        isBlackText
        isThin
        description={get(item, 'memo')}
      />
    </Animated.View>
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
