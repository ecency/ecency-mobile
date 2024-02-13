import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import { useQuery } from '@tanstack/react-query';
import Animated, { BounceIn } from 'react-native-reanimated';
import { ScaleSlider } from '../../../components';
import { hsOptions } from '../../../constants/hsOptions';

// Services and Actions
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import { getBoostPlusAccount, getBoostPlusPrice } from '../../../providers/ecency/ecency';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { Modal } from '../../../components/modal';

// Styles
import styles from './boostPlus.styles';
import { OptionsModal } from '../../../components/atoms';
import QUERIES from '../../../providers/queries/queryKeys';

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
  const [price, setPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState(false);

  const startActionSheet = useRef(null);

  const boostPricesQuery = useQuery([QUERIES.REDEEM.GET_BOOST_PLUS_PRICES], getBoostPlusPrice, {
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
    const pr = _boostPrices[_boostDays.indexOf(day)];

    setIsValid(pr <= balance);
    setPrice(pr);
  }, [day, balance, boostPricesQuery.data]);

  useEffect(() => {
    if (selectedUser) {
      _getUserBalance(selectedUser);
    }

    _checkBoostStatus();
  }, [selectedUser]);

  const _selectedUser = selectedUser || currentAccountName;

  // Component Functions

  const _checkBoostStatus = async () => {
    const response = await getBoostPlusAccount(_selectedUser);
    if (response?.account === _selectedUser) {
      const expiryDate = new Date(response.expires);
      if (expiryDate > new Date()) {
        setExpiryDate(expiryDate);
        return;
      }
    }

    setExpiryDate(null);
  };

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

  const _getUserBalance = async (username) => {
    await getPointsSummary(username)
      .then((userPoints) => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        setBalance(balance);
      })
      .catch((err) => {
        Alert.alert(err.message || err.toString());
      });
  };

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
              <Text style={styles.price}>{`${price} Points  `}</Text>
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
