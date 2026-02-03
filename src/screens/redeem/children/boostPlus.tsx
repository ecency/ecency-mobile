import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useQuery } from '@tanstack/react-query';
import Animated, { BounceIn } from 'react-native-reanimated';
import {
  getBoostPlusAccountPricesQueryOptions,
  getBoostPlusPricesQueryOptions,
  getPointsQueryOptions,
} from '@ecency/sdk';
import { ScaleSlider } from '../../../components';
import { hsOptions } from '../../../constants/hsOptions';

// Services and Actions

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { Modal } from '../../../components/modal';

// Styles
import styles from '../styles/boostPlus.styles';
import { OptionsModal } from '../../../components/atoms';
import QUERIES from '../../../providers/queries/queryKeys';
import RootNavigation from '../../../navigation/rootNavigation';
import ROUTES from '../../../constants/routeNames';
import { useAuth } from '../../../hooks';

const BoostPlus = ({
  intl,
  handleOnSubmit,
  redeemType,
  isLoading,
  accounts,
  currentAccountName,
  balance: _balance,
  SCPath,
  isSCModalOpen,
  handleOnSCModalClose,
}) => {
  const [selectedUser, setSelectedUser] = useState('');
  const [balance, setBalance] = useState(_balance);
  const [day, setDay] = useState(7);
  const [price, setPrice] = useState<number | null>(null);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState(false);

  const startActionSheet = useRef(null);
  const startActionSheetP = useRef(null);

  const { code } = useAuth();
  const boostPricesQuery = useQuery({
    ...getBoostPlusPricesQueryOptions(code),
    queryKey: [QUERIES.REDEEM.GET_BOOST_PLUS_PRICES, code],
    initialData: [],
  });

  const _boostDays = useMemo(
    () => boostPricesQuery.data.map((item) => item.duration),
    [boostPricesQuery.data],
  );
  const _boostPrices = useMemo(
    () => boostPricesQuery.data.map((item) => item.price),
    [boostPricesQuery.data],
  );

  useEffect(() => {
    setBalance(_balance);
  }, [_balance]);

  useEffect(() => {
    const index = _boostDays.indexOf(day);
    const pr = index >= 0 ? _boostPrices[index] : undefined;

    setIsValid(pr != null && pr <= balance);
    setPrice(pr ?? null);
  }, [day, balance, boostPricesQuery.data]);

  const _selectedUser = selectedUser || currentAccountName;

  const pointsQuery = useQuery({
    ...getPointsQueryOptions(_selectedUser, 0),
    enabled: !!_selectedUser,
  });

  const boostAccountQuery = useQuery({
    ...getBoostPlusAccountPricesQueryOptions(_selectedUser, code),
    enabled: !!_selectedUser && !!code,
  });

  useEffect(() => {
    if (!pointsQuery.data || pointsQuery.data.points === undefined) {
      return;
    }
    const points = Number(pointsQuery.data?.points);
    const balanceValue = Math.round(points * 1000) / 1000;
    setBalance(Number.isNaN(balanceValue) ? _balance : balanceValue);
  }, [pointsQuery.data, _balance]);

  useEffect(() => {
    const response = boostAccountQuery.data;
    if (response?.account === _selectedUser) {
      const expiry = new Date(response.expires);
      if (expiry > new Date()) {
        setExpiryDate(expiry);
        return;
      }
    }
    setExpiryDate(null);
  }, [boostAccountQuery.data, _selectedUser]);

  // Component Functions

  const _renderExpiryDetails = () =>
    expiryDate && (
      <Animated.View entering={BounceIn}>
        <Text style={styles.expiryDate}>
          {intl.formatMessage(
            { id: 'boost_plus.already_boosted' },
            { date: expiryDate.toDateString() },
          )}
        </Text>
      </Animated.View>
    );

  const _renderDropdown = (accounts, currentAccountName) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={accounts.map((item) => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex((item) => item.username === currentAccountName)}
      onSelect={(index, value) => {
        setSelectedUser(value);
      }}
    />
  );

  // balance is derived from pointsQuery; no manual fetch needed

  const _handleOnSubmit = async () => {
    // TODO: later add support to boost other accounts
    handleOnSubmit(redeemType, day, _selectedUser, selectedUser);
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'boost_plus.title' })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'promote.user' })}
              rightComponent={() => _renderDropdown(accounts, _selectedUser)}
            />
            <Text style={styles.balanceText}>{`${balance} Points`}</Text>

            <View style={styles.total}>
              <Text style={styles.day}>
                {`${day} ${intl.formatMessage({
                  id: 'promote.days',
                })} `}
              </Text>
              <Text style={styles.price}>{`${price ?? '--'} Points  `}</Text>
            </View>

            <ScaleSlider
              values={_boostDays}
              LRpadding={50}
              activeValue={day}
              handleOnValueChange={(_day) => setDay(_day)}
              single
            />
          </View>

          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              isDisable={isLoading || !isValid || !!expiryDate}
              onPress={() => startActionSheet.current.show()}
              isLoading={isLoading}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
            <View style={styles.separator} />
            <Text style={styles.descText}>{intl.formatMessage({ id: 'boost.account.desc' })}</Text>
            <MainButton
              style={styles.button}
              isDisable={isLoading || !!expiryDate}
              onPress={() => startActionSheetP.current.show()}
              isLoading={isLoading}
            >
              <Text style={styles.buttonText}>
                {intl.formatMessage({ id: 'boost_plus.title' })}
              </Text>
            </MainButton>
          </View>
          {_renderExpiryDetails()}
        </ScrollView>
      </View>
      <OptionsModal
        ref={startActionSheet}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'boost_plus.confirm_boost' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            _handleOnSubmit();
          }
        }}
      />
      <OptionsModal
        ref={startActionSheetP}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'boost_plus.confirm_boost_plus' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            RootNavigation.navigate({ name: ROUTES.SCREENS.ACCOUNT_BOOST });
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

export default injectIntl(BoostPlus);
