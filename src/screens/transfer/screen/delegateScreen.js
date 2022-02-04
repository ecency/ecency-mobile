import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import Slider from '@esteemapp/react-native-slider';
import get from 'lodash/get';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// Constants
import { debounce } from 'lodash';
import AUTH_TYPE from '../../../constants/authType';
import { hsOptions } from '../../../constants/hsOptions';

// Components
import {
  BasicHeader,
  TransferFormItem,
  DropdownButton,
  TextInput,
  MainButton,
  UserAvatar,
  Icon,
  Modal,
} from '../../../components';

import parseToken from '../../../utils/parseToken';
import { isEmptyDate } from '../../../utils/time';
import { hpToVests, vestsToHp } from '../../../utils/conversions';
import TransferFormItemView from '../../../components/transferFormItem/view/transferFormItemView';

// Styles
import styles from './transferStyles';
import { OptionsModal } from '../../../components/atoms';

class DelegateScreen extends Component {
  _handleOnAmountChange = debounce(
    async (state, amount) => {
      let _amount = amount.toString();
      if (_amount.includes(',')) {
        _amount = amount.replace(',', '.');
      }

      this._setState(state, _amount);
    },
    200,
    { leading: true },
  );

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      isAmountValid: false,
      hp: 0,
      isTransfering: false,
      from: props.currentAccountName,
      destination: '',
      steemConnectTransfer: false,
      usersResult: [],
      step: 1,
    };

    this.startActionSheet = React.createRef();
  }

  // Component Life Cycles

  // Component Functions
  _setState = (key, value) => {
    const { getAccountsWithUsername, balance } = this.props;
    if (key) {
      switch (key) {
        case 'destination':
          getAccountsWithUsername(value).then((res) => {
            const isValid = res.includes(value);
            this.setState({ usersResult: [...res] });
            this.setState({ isUsernameValid: isValid });
          });
          if (!value) {
            this.setState({ destination: '', step: 1 });
          }

          break;
        case 'amount':
          if (parseFloat(Number(value)) <= parseFloat(balance)) {
            this.setState({ [key]: value });
          }
          break;

        default:
          this.setState({ [key]: value });
          break;
      }
    }
  };

  _handleAmountChange = (hp, availableVests) => {
    if (!hp) {
      this.setState({ step: 2, hp: 0, amount: 0, isAmountValid: false });
      return;
    }
    const parsedValue = parseFloat(Number(hp));
    const { hivePerMVests } = this.props;
    const vestsForHp = hpToVests(hp, hivePerMVests);
    const totalHP = vestsToHp(availableVests, hivePerMVests).toFixed(3);
    if (Number.isNaN(parsedValue)) {
      this.setState({ amount: 0, hp: 0, step: 2, isAmountValid: false });
    } else if (parsedValue > totalHP) {
      this.setState({
        amount: hpToVests(totalHP, hivePerMVests),
        hp: totalHP,
        step: 2,
        isAmountValid: false,
      });
    } else {
      this.setState({ amount: vestsForHp, hp: parsedValue, step: 3, isAmountValid: true });
    }
  };
  _handleTransferAction = () => {
    const { transferToAccount, accountType } = this.props;
    const { from, destination, amount } = this.state;

    this.setState({ isTransfering: true });

    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      this.setState({ steemConnectTransfer: true });
    } else {
      transferToAccount(from, destination, amount, '');
    }
  };

  _handleOnDropdownChange = (value) => {
    const { fetchBalance } = this.props;

    fetchBalance(value);
    this.setState({ from: value, amount: 0 });
  };

  _renderDropdown = (accounts, currentAccountName) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={accounts.map((item) => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex((item) => item.username === currentAccountName)}
      onSelect={(index, value) => this._handleOnDropdownChange(value)}
    />
  );

  _renderUsersDropdownItem = ({ item }) => {
    const username = item;
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({ destination: username, usersResult: [], step: 2 });
        }}
        style={styles.usersDropItemRow}
      >
        <UserAvatar username={username} noAction />
        <Text style={styles.usersDropItemRowText}>{username}</Text>
      </TouchableOpacity>
    );
  };

  _renderUsersDropdown = () => (
    <FlatList
      data={this.state.usersResult}
      keyboardShouldPersistTaps="always"
      renderItem={this._renderUsersDropdownItem}
      keyExtractor={(item) => `searched-user-${item}`}
      style={styles.usersDropdown}
      ListFooterComponent={<View />}
      ListFooterComponentStyle={{ height: 20 }} //this fixes the last item visibility bug
    />
  );
  _renderInput = (placeholder, state, keyboardType, availableVestingShares, isTextArea) => {
    const { isAmountValid } = this.state;
    switch (state) {
      case 'destination':
        return (
          <View style={styles.transferToContainer}>
            <TextInput
              style={[isTextArea ? styles.textarea : styles.input]}
              onChangeText={(value) => {
                this.setState({ destination: value });
                this._handleOnAmountChange(state, value);
              }}
              value={this.state[state]}
              placeholder={placeholder}
              placeholderTextColor="#c1c5c7"
              autoCapitalize="none"
              multiline={isTextArea}
              numberOfLines={isTextArea ? 4 : 1}
              keyboardType={keyboardType}
            />

            <View style={styles.usersDropdownContainer}>
              {this.state.destination !== '' &&
                this.state.usersResult.length !== 0 &&
                this._renderUsersDropdown()}
            </View>
          </View>
        );
      case 'amount':
        return (
          <TextInput
            style={[styles.input, !isAmountValid && styles.error]}
            onChangeText={(amount) => {
              this._handleAmountChange(amount, availableVestingShares);
            }}
            value={this.state.hp.toString()}
            placeholder={placeholder}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            multiline={isTextArea}
            numberOfLines={isTextArea ? 4 : 1}
            keyboardType={keyboardType}
          />
        );
      default:
        null;
        break;
    }
  };

  _renderInformationText = (text) => <Text style={styles.amountText}>{text}</Text>;

  render() {
    const {
      intl,
      accounts,
      currentAccountName,
      selectedAccount,
      handleOnModalClose,
      hivePerMVests,
      accountType,
    } = this.props;
    const { amount, isTransfering, from, destination, steemConnectTransfer, step } = this.state;
    let availableVestingShares = 0;
    if (!isEmptyDate(get(selectedAccount, 'next_vesting_withdrawal'))) {
      // powering down
      availableVestingShares =
        parseToken(get(selectedAccount, 'vesting_shares')) -
        (Number(get(selectedAccount, 'to_withdraw')) - Number(get(selectedAccount, 'withdrawn'))) /
          1e6 -
        parseToken(get(selectedAccount, 'delegated_vesting_shares'));
    } else {
      // not powering down
      availableVestingShares =
        parseToken(get(selectedAccount, 'vesting_shares')) -
        parseToken(get(selectedAccount, 'delegated_vesting_shares'));
    }
    const fixedAmount = `${amount.toFixed(6)} VESTS`;
    // eslint-disable-next-line max-len
    const path = `sign/delegate-vesting-shares?delegator=${from}&delegatee=${destination}&vesting_shares=${encodeURIComponent(
      fixedAmount,
    )}`;

    const spCalculated = vestsToHp(amount, hivePerMVests);
    const totalHP = vestsToHp(availableVestingShares, hivePerMVests);
    const _renderStepOne = () => (
      <>
        <View style={styles.topContent}>
          <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
          <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
          <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
        </View>
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.from' })}
          rightComponent={() => this._renderDropdown(accounts, currentAccountName)}
        />
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.to' })}
          rightComponent={() =>
            this._renderInput(
              intl.formatMessage({ id: 'transfer.to_placeholder' }),
              'destination',
              'default',
            )
          }
        />
      </>
    );
    const _renderStepTwo = () => (
      <>
        {/* <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.amount' })}
          rightComponent={() => this._renderInformationText(`${amount.toFixed(6)} VESTS`)}
        /> */}
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.amount' })}
          rightComponent={() =>
            this._renderInput(
              intl.formatMessage({ id: 'transfer.amount' }),
              'amount',
              'number-pad',
              availableVestingShares,
            )
          }
          containerStyle={styles.paddBottom}
        />
        {/*
        <TransferFormItemView
          rightComponent={() =>
            this._renderInformationText(`${(availableVestingShares - amount).toFixed(6)} VESTS`)
          }
        /> */}
        <TransferFormItem
          rightComponent={() =>
            this._renderInformationText(`${(totalHP - spCalculated).toFixed(3)} HP`)
          }
        />
        <Slider
          style={styles.slider}
          trackStyle={styles.track}
          thumbStyle={styles.thumb}
          minimumTrackTintColor="#357ce6"
          thumbTintColor="#007ee5"
          maximumValue={availableVestingShares}
          value={amount}
          onValueChange={(value) => {
            this.setState({ amount: value, hp: vestsToHp(value, hivePerMVests).toFixed(3) });
            if (value !== 0 && value !== availableVestingShares) {
              this.setState({ step: 3, isAmountValid: true });
            }
          }}
        />
        <Text style={styles.informationText}>
          {intl.formatMessage({ id: 'transfer.amount_information' })}
        </Text>
      </>
    );
    const _renderStepThree = () => (
      <>
        <MainButton
          style={styles.button}
          onPress={() => this.startActionSheet.current.show()}
          isLoading={isTransfering}
        >
          <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
        </MainButton>
      </>
    );

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'transfer.delegate' })} />
        <KeyboardAwareScrollView contentContainerStyle={styles.fillSpace} keyboardShouldPersistTaps>
          <View style={styles.container}>
            <View style={styles.stepOneContainer}>{_renderStepOne()}</View>
            <View style={styles.stepTwoContainer}>{step >= 2 && _renderStepTwo()}</View>
            <View style={styles.stepThreeContainer}>{step >= 3 && _renderStepThree()}</View>
          </View>
        </KeyboardAwareScrollView>
        <OptionsModal
          ref={this.startActionSheet}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'transfer.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={(index) => (index === 0 ? this._handleTransferAction() : null)}
        />
        <Modal
          isOpen={steemConnectTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${path}` }} />
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(DelegateScreen);
