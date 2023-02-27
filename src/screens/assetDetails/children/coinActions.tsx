import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './children.styles';

interface CoinActionsProps {
  actions: string[];
  onActionPress: (action: string) => void;
}

export const CoinActions = ({ actions, onActionPress }: CoinActionsProps) => {
  const intl = useIntl();

  const _renderItem = (item: string, index: number) => {
    const _onPress = () => {
      onActionPress(item);
    };

    return (
      <TouchableOpacity
        key={`action-${item}-${index}`}
        style={styles.actionContainer}
        onPress={_onPress}
      >
        <Fragment>
          <Text style={styles.actionText}>{intl.formatMessage({ id: `wallet.${item}` })}</Text>
        </Fragment>
      </TouchableOpacity>
    );
  };

  return <View style={styles.actionsContainer}>{actions.map(_renderItem)}</View>;
};
