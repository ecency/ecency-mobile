import React, { Component, Fragment } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import Slider from '@esteemapp/react-native-slider';
import get from 'lodash/get';

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
import { vestsToHp } from '../../../utils/conversions';

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
      isTransfering: false,
      from: props.currentAccountName,
      destination: '',
      steemConnectTransfer: false,
      usersResult: [],
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
            this.setState({ destination: '' });
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
          this.setState({ destination: username, usersResult: [] });
        }}
        style={styles.usersDropItemRow}
      >
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
      ListFooterComponentStyle={{ height: 20 }}
    />
  );
  _renderInput = (placeholder, state, keyboardType, isTextArea) => {
    switch (state) {
      case 'destination':
        return (
          <View style={styles.transferToContainer}>
            <TextInput
              style={[isTextArea ? styles.textarea : styles.input]}
              onChangeText={(amount) => {
                this.setState({ destination: amount });
                this._handleOnAmountChange(state, amount);
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
            style={[isTextArea ? styles.textarea : styles.input]}
            onChangeText={(amount) => this._handleOnAmountChange(state, amount)}
            value={this.state[state]}
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
    const { amount, isTransfering, from, destination, steemConnectTransfer } = this.state;
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
    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'transfer.delegate' })} />
        <View style={styles.container}>
          <View style={styles.topContent}>
            <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
            <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
            <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
          </View>
          <View style={styles.middleContent}>
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
              containerStyle={{ zIndex: 1 }}
            />
            <TransferFormItem
              label={intl.formatMessage({ id: 'transfer.amount' })}
              rightComponent={() => this._renderInformationText(`${amount.toFixed(6)} VESTS`)}
            />

            <TransferFormItem
              rightComponent={() => this._renderInformationText(`${spCalculated.toFixed(3)} HP`)}
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
                this.setState({ amount: value });
              }}
            />
            <Text style={styles.informationText}>
              {intl.formatMessage({ id: 'transfer.amount_information' })}
            </Text>
          </View>
          <View style={styles.bottomContent}>
            <MainButton
              style={styles.button}
              onPress={() => this.startActionSheet.current.show()}
              isLoading={isTransfering}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
        </View>
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
