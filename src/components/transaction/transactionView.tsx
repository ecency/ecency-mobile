import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';

// Utilities
import Animated, { SlideInLeft } from 'react-native-reanimated';
import { getTimeFromNow } from '../../utils/time';

// Components
import { WalletLineItem } from '../basicUIElements';
import { getHumanReadableKeyString } from '../../utils/strings';

const TransactionView = ({ item, index, cancelling, onCancelPress, onRepeatPress }: any) => {
  const intl = useIntl();
  const [collapsed, setCollapsed] = useState(true);

  const title = intl.messages[`wallet.${item.textKey}`]
    ? intl.formatMessage({
        id: `wallet.${item.textKey}`,
      })
    : getHumanReadableKeyString(item.textKey);

  // Recurrent-transfer rows carry their cadence/remaining count instead of a plain
  // timestamp, mirroring how the schedule reads on the web wallet. A real schedule needs
  // a positive cadence and run count; treat 0/blank (e.g. a cancellation, which grooms
  // executions to '0') as "no schedule" and fall back to the timestamp rather than
  // rendering "0 transfers, each every N hours".
  const recurrentSubtitle =
    item.textKey === 'recurrent_transfer' &&
    Number(item.executions) > 0 &&
    Number(item.recurrence) > 0
      ? intl.formatMessage(
          {
            id: 'recurrent.schedule_summary',
            defaultMessage: '{executions} transfers, each every {hours} hours',
          },
          { executions: item.executions, hours: item.recurrence },
        )
      : item.textKey === 'fill_recurrent_transfer' && item.executions
      ? intl.formatMessage(
          { id: 'recurrent.remaining_executions' },
          { executions: item.executions },
        )
      : null;

  const _onRepeatPress = () => {
    if (onRepeatPress) {
      onRepeatPress();
    }
  };

  const _cardHeader = (
    <WalletLineItem
      key={`keyt-${item.created.toString()}`}
      index={index + 1}
      text={title}
      description={
        recurrentSubtitle ||
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
      onRepeatPress={item?.repeatable ? _onRepeatPress : null}
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
