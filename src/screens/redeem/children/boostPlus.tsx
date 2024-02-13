import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import { ScaleSlider } from '../../../components/';
import { hsOptions } from '../../../constants/hsOptions';

// Services and Actions
import { getPointsSummary } from '../../../providers/ecency/ePoint';
import { getBoostPlusPrice, } from '../../../providers/ecency/ecency';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { Modal } from '../../../components/modal';

// Styles
import styles from './boostPlus.styles';
import { OptionsModal } from '../../../components/atoms';
import { useQuery } from '@tanstack/react-query';
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
  const [isValid, setIsValid] = useState(false);

  const startActionSheet = useRef(null);
  let timer = null;


  const boostPricesQuery = useQuery([QUERIES.REDEEM.GET_BOOST_PLUS_PRICES], getBoostPlusPrice, {initialData:[]})

  const _boostDays = useMemo(()=>boostPricesQuery.data.map(item=>item.duration),[boostPricesQuery.data])
  const _boostPrices = useMemo(()=>boostPricesQuery.data.map(item=>item.price),[boostPricesQuery.data])


  useEffect(()=>{
    setBalance(_balance);
  },[_balance])

  useEffect(() => {
    const pr = _boostPrices[_boostDays.indexOf(day)];
 
    setIsValid(pr <= balance);
    setPrice(pr);

  }, [day, balance, boostPricesQuery.data]);



  useEffect(() => {
    if (selectedUser) {
      _getUserBalance(selectedUser);
    }
  }, [selectedUser]);



  // Component Functions


  const _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;

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
    //TODO: later add support to boost other accounts
    handleOnSubmit(redeemType, day, selectedUser, selectedUser);
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'boost_plus.title' })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'promote.user' })}
              rightComponent={() => _renderDropdown(accounts, selectedUser || currentAccountName)}
            />
            <Text style={styles.balanceText}>{`${balance} Points`}</Text>

            <View style={styles.total}>
              <Text style={styles.day}>
                {`${day} ${intl.formatMessage({
                  id: 'promote.days',
                })} `}
              </Text>
              <Text style={styles.price}>
                {`${price} Points  `}
              </Text>
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
              isDisable={
                (isLoading || !isValid)
              }
              onPress={() => startActionSheet.current.show()}
              isLoading={isLoading}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
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
