import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { ComponentType, Fragment, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './children.styles';
import { Icon, MainButton, SimpleChart } from '../../../components';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { COIN_IDS } from '../../../constants/defaultCoins';

export interface CoinCardProps {
  id: string;
  chartData: number[];
  name: string;
  notCrypto: boolean;
  symbol: string;
  currencySymbol: string;
  changePercent: number;
  currentValue: number;
  ownedTokens: number;
  unclaimedRewards: string;
  enableBuy?: boolean;
  isClaiming?: boolean;
  isLoading?: boolean;
  footerComponent: ComponentType<any>;
  onCardPress: () => void;
  onClaimPress: () => void;
  onBoostAccountPress: () => void;
}

export const CoinCard = ({
  id,
  notCrypto,
  chartData,
  currencySymbol,
  symbol,
  changePercent,
  currentValue,
  ownedTokens,
  footerComponent,
  unclaimedRewards,
  enableBuy,
  isClaiming,
  isLoading,
  onCardPress,
  onClaimPress,
  onBoostAccountPress,
}: CoinCardProps) => {
  const intl = useIntl();

  const [claimExpected, setClaimExpected] = useState(false);

  useEffect(() => {
    if (!isClaiming && claimExpected) {
      setClaimExpected(false);
    }
  }, [isClaiming]);

  const _onClaimPress = () => {
    setClaimExpected(!!unclaimedRewards);
    onClaimPress();
  };

  const _renderHeader = (
    <View style={styles.cardHeader}>
      {/* <View style={styles.logo} /> */}
      <View style={styles.cardTitleContainer}>
        <Text style={styles.textTitle}>{symbol}</Text>
        <Text style={styles.textSubtitle}>{intl.formatMessage({ id: `wallet.${id}.name` })}</Text>
      </View>
      <View style={styles.cardValuesContainer}>
        <Text style={styles.textTitle}>{`${ownedTokens.toFixed(3)} ${symbol}`}</Text>
        <Text style={styles.textSubtitleRight}>
          {`${(ownedTokens * currentValue).toFixed(2)}${currencySymbol}`}
        </Text>
      </View>
    </View>
  );

  const _renderClaimSection = () => {
    if (unclaimedRewards || enableBuy) {
      const btnTitle = unclaimedRewards || intl.formatMessage({ id: `wallet.${id}.buy` });

      const _rightComponent = isLoading ? (
        <ActivityIndicator
          color={EStyleSheet.value('$pureWhite')}
          style={styles.claimActivityIndicator}
        />
      ) : (
        <View style={styles.claimIconWrapper}>
          <Icon
            name="add"
            iconType="MaterialIcons"
            color={EStyleSheet.value('$primaryBlue')}
            size={23}
          />
        </View>
      );

      return (
        <View style={styles.claimContainer}>
          <MainButton
            isLoading={isClaiming && claimExpected}
            isDisable={isLoading || (isClaiming && claimExpected)}
            style={styles.claimBtn}
            height={50}
            onPress={_onClaimPress}
          >
            <Fragment>
              <Text style={styles.claimBtnTitle}>{btnTitle}</Text>
              {_rightComponent}
            </Fragment>
          </MainButton>
        </View>
      );
    }
  };

  const _renderBoostAccount = () => {
    if (id === COIN_IDS.HP && ownedTokens < 50) {
      const _rightComponent = (
        <View style={styles.claimIconWrapper}>
          <Icon
            name="add"
            iconType="MaterialIcons"
            color={EStyleSheet.value('$primaryBlue')}
            size={23}
          />
        </View>
      );

      return (
        <View style={styles.claimContainer}>
          <MainButton style={styles.claimBtn} height={50} onPress={onBoostAccountPress}>
            <Fragment>
              <Text style={styles.claimBtnTitle}>
                {intl.formatMessage({ id: 'wallet.get_boost' })}
              </Text>
              {_rightComponent}
            </Fragment>
          </MainButton>
        </View>
      );
    }
  };

  const _renderGraph = () => {
    const _baseWidth = getWindowDimensions().width - 32;
    return (
      <View style={styles.chartContainer}>
        <SimpleChart data={chartData} baseWidth={_baseWidth} showLine={false} chartHeight={130} />
      </View>
    );
  };

  const _renderFooter = (
    <View style={styles.cardFooter}>
      <Text style={styles.textCurValue}>{`${currencySymbol} ${currentValue.toFixed(2)}`}</Text>
      <Text style={changePercent > 0 ? styles.textDiffPositive : styles.textDiffNegative}>{`${
        changePercent >= 0 ? '+' : ''
      }${changePercent.toFixed(1)}%`}</Text>
    </View>
  );

  return (
    <TouchableOpacity onPress={onCardPress}>
      <View style={styles.cardContainer}>
        {_renderHeader}
        {_renderClaimSection()}
        {_renderBoostAccount()}
        {!notCrypto && _renderGraph()}
        {!notCrypto ? _renderFooter : <View style={{ height: 12 }} />}
        {footerComponent && footerComponent}
      </View>
    </TouchableOpacity>
  );
};
