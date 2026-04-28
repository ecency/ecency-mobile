import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import { View, Text, TouchableOpacity } from 'react-native';
import { AssetIcon } from '../../../components/atoms';
import { DataPair } from '../../../redux/reducers/walletReducer';
import styles from './children.styles';
import { Icon } from '../../../components/index';

interface CoinBasicsProps {
  valuePairs: DataPair[];
  extraData: DataPair[];
  coinSymbol: string;
  apr?: number;
  iconUrl?: string;
  isEngine: boolean;
  isRenderChart?: boolean;
  showChart: boolean;
  setShowChart: (value: boolean) => void;
  onInfoPress: (id: string) => void;
  onAnalyticsPress?: () => void;
}

export const CoinBasics = ({
  valuePairs,
  extraData,
  coinSymbol,
  apr,
  iconUrl,
  isEngine,
  isRenderChart,
  showChart,
  setShowChart,
  onInfoPress,
  onAnalyticsPress,
}: CoinBasicsProps) => {
  const intl = useIntl();
  const _renderCoinHeader = (
    <>
      <View style={styles.coinTitleContainer}>
        <AssetIcon
          iconUrl={iconUrl}
          iconSize={40}
          containerStyle={styles.iconContainer}
          isEngine={isEngine}
        />
        <Text style={styles.textCoinTitle}>{coinSymbol}</Text>
        {onAnalyticsPress && (
          <TouchableOpacity
            onPress={onAnalyticsPress}
            style={styles.analyticsIcon}
            accessibilityLabel={intl.formatMessage({ id: 'wallet.openAnalytics' })}
          >
            <Icon
              iconType="MaterialCommunityIcons"
              name="chart-line"
              style={styles.eyeIcon}
              size={20}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.percentEyeContainer}>
        <TouchableOpacity
          disabled={!isRenderChart}
          onPress={() => {
            if (!isRenderChart) return;
            setShowChart(!showChart);
          }}
          accessibilityLabel={
            isRenderChart
              ? intl.formatMessage({
                  id: showChart ? 'wallet.hideChart' : 'wallet.showChart',
                })
              : undefined
          }
        >
          <View style={styles.percentEyeContainer}>
            {apr !== undefined && apr !== null ? (
              <Text style={styles.textHeaderApr}>
                {intl.formatMessage({ id: 'wallet.apr' })} {apr.toFixed(apr < 10 ? 3 : 2)}%
              </Text>
            ) : (
              <View style={styles.textHeaderApr} />
            )}
            {!!isRenderChart && (
              <Icon
                iconType="Ionicons"
                name={showChart ? 'eye' : 'eye-off'}
                style={styles.eyeIcon}
                size={20}
              />
            )}
          </View>
        </TouchableOpacity>
      </View>
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
