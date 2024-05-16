import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { View, Text } from 'react-native';
import { AssetIcon } from '../../../components/atoms';
import { DataPair } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';

interface CoinBasicsProps {
  assetId: string;
  valuePairs: DataPair[];
  extraData: DataPair[];
  coinSymbol: string;
  percentChange: number;
  iconUrl?: string;
  isEngine: boolean;
  onInfoPress: (id: string) => void;
}

export const CoinBasics = ({
  assetId,
  valuePairs,
  extraData,
  coinSymbol,
  percentChange,
  iconUrl,
  isEngine,
  onInfoPress,
}: CoinBasicsProps) => {
  const intl = useIntl();
  const _renderCoinHeader = (
    <>
      <View style={styles.coinTitleContainer}>
        <AssetIcon
          id={assetId}
          iconUrl={iconUrl}
          iconSize={40}
          containerStyle={styles.iconContainer}
          isEngine={isEngine}
        />
        <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
      </View>

      {percentChange ? (
        <Text style={styles.textHeaderChange}>
          {intl.formatMessage({ id: 'wallet.change' })}
          <Text style={percentChange > 0 ? styles.textPositive : styles.textNegative}>
            {percentChange
              ? ` ${percentChange >= 0 ? '+' : ''}${percentChange.toFixed(1)}%`
              : ' ---'}
          </Text>
        </Text>
      ) : (
        <View style={styles.textHeaderChange} />
      )}
    </>
  );

  const _renderValuePair = (args: DataPair, index: number) => {
    const label = intl.formatMessage({ id: `wallet.${args.dataKey}` });
    return (
      <Fragment key={`basic-data-${args.dataKey}-${index}`}>
        <Text style={styles.textBasicValue}>{args.value}</Text>
        <Text style={styles.textBasicLabel}>{label}</Text>
      </Fragment>
    );
  };

  const _renderExtraData = (args: DataPair, index: number) => {
    const label = intl.formatMessage(
      { id: `wallet.${args.dataKey || args.labelId}` },
      args.subValue ? { subValue: args.subValue } : undefined,
    );

    const _onPress = () => {
      onInfoPress(args.dataKey);
    };

    return (
      <View key={`extra-data-${args.dataKey}-${index}`} style={styles.extraDataContainer}>
        <Text
          style={[styles.textExtraLabel, args.isClickable && styles.textUnderline]}
          onPress={args.isClickable && _onPress}
        >
          {label}
        </Text>
        <Text style={styles.textExtraValue} onPress={args.isClickable && _onPress}>
          {args.value}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.card, styles.basicsContainer]}>
      {_renderCoinHeader}
      {valuePairs.map(_renderValuePair)}
      {extraData && extraData.map(_renderExtraData)}
    </View>
  );
};
