import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { useQuery } from '@tanstack/react-query';
import { getRcDelegationPricesQueryOptions, getPointsQueryOptions } from '@ecency/sdk';
import { ScaleSlider } from '../../../components';
import { hsOptions } from '../../../constants/hsOptions';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { Modal } from '../../../components/modal';

// Styles (reuses the generic redeem-form styles)
import styles from '../styles/boostPlus.styles';
import { OptionsModal } from '../../../components/atoms';
import { useAuth } from '../../../hooks';

const RcTopUp = ({
  intl,
  handleOnSubmit,
  redeemType,
  isLoading,
  currentAccountName,
  balance: _balance,
  SCPath,
  isSCModalOpen,
  handleOnSCModalClose,
}) => {
  const [balance, setBalance] = useState(_balance);
  const [day, setDay] = useState(1);
  const [price, setPrice] = useState<number | null>(null);
  const [isValid, setIsValid] = useState(false);

  const startActionSheet = useRef(null);

  const { code } = useAuth();

  const pricesQuery = useQuery({
    ...getRcDelegationPricesQueryOptions(code),
    enabled: !!code,
  });

  const { rcDays: _rcDays, rcPrices: _rcPrices } = useMemo(() => {
    if (!pricesQuery.data || !Array.isArray(pricesQuery.data)) {
      return { rcDays: [], rcPrices: [] };
    }

    const normalized = pricesQuery.data
      .map((item) => {
        const duration = Number(item.duration);
        const price = Number(item.price);
        return { duration, price };
      })
      .filter((item) => Number.isFinite(item.duration) && Number.isFinite(item.price));

    return {
      rcDays: normalized.map((item) => item.duration),
      rcPrices: normalized.map((item) => item.price),
    };
  }, [pricesQuery.data]);

  useEffect(() => {
    setBalance(_balance);
  }, [_balance]);

  useEffect(() => {
    if (_rcDays.length > 0 && !_rcDays.includes(day)) {
      setDay(_rcDays[0]);
    }

    const index = _rcDays.indexOf(day);
    const pr = index >= 0 ? _rcPrices[index] : undefined;

    setIsValid(pr != null && pr <= balance);
    setPrice(pr ?? null);
  }, [day, balance, pricesQuery.data]);

  const pointsQuery = useQuery({
    ...getPointsQueryOptions(currentAccountName, 0),
    enabled: !!currentAccountName,
  });

  useEffect(() => {
    if (!pointsQuery.data || pointsQuery.data.points === undefined) {
      return;
    }
    const points = Number(String(pointsQuery.data?.points ?? '').replace(/,/g, ''));
    const balanceValue = Math.round(points * 1000) / 1000;
    setBalance(Number.isNaN(balanceValue) ? _balance : balanceValue);
  }, [pointsQuery.data, _balance]);

  const _renderDropdown = (accountName) => <Text style={styles.dropdownText}>{accountName}</Text>;

  const _handleOnSubmit = async () => {
    handleOnSubmit(redeemType, day, currentAccountName, currentAccountName);
  };

  // low on Points: funnel to the in-app Points purchase (native Apple/Google
  // billing) so the user can buy Points and come back to finish the top-up.
  const insufficient = price != null && price > balance;

  const _onBuyPoints = () => {
    RootNavigation.navigate({
      name: ROUTES.SCREENS.BOOST,
      params: { username: currentAccountName },
    });
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'rc_topup.title' })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'promote.user' })}
              rightComponent={() => _renderDropdown(currentAccountName)}
            />
            <Text style={styles.balanceText}>{`${balance} Points`}</Text>

            {insufficient && (
              <Text style={styles.insufficientText}>
                {intl.formatMessage({ id: 'rc_topup.insufficient' })}
              </Text>
            )}
            <TouchableOpacity style={styles.buyPointsButton} onPress={_onBuyPoints}>
              <Text style={styles.buyPointsText}>
                {intl.formatMessage({ id: 'rc_topup.buy_points' })}
              </Text>
            </TouchableOpacity>

            <View style={styles.total}>
              <Text style={styles.day}>
                {`${_rcDays.length > 0 ? day : '--'} ${intl.formatMessage({
                  id: 'promote.days',
                })} `}
              </Text>
              <Text style={styles.price}>{`${price ?? '--'} Points  `}</Text>
            </View>

            {_rcDays.length > 0 && (
              <ScaleSlider
                values={_rcDays}
                LRpadding={50}
                activeValue={day}
                handleOnValueChange={(_day) => setDay(_day)}
                single
              />
            )}
          </View>

          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              isDisable={isLoading || !isValid}
              onPress={() => startActionSheet.current.show()}
              isLoading={isLoading}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
            <View style={styles.separator} />
            <Text style={styles.descText}>{intl.formatMessage({ id: 'rc_topup.desc' })}</Text>
          </View>
        </ScrollView>
      </View>
      <OptionsModal
        ref={startActionSheet}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'rc_topup.confirm' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            _handleOnSubmit();
          }
        }}
      />
      <Modal
        isOpen={isSCModalOpen}
        isFullScreen
        isCloseButton
        handleOnModalClose={handleOnSCModalClose}
        title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
      >
        <WebView source={{ uri: `${hsOptions.base_url}${SCPath}` }} />
      </Modal>
    </Fragment>
  );
};

export default injectIntl(RcTopUp);
