import React, { Fragment, Component } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

import { hsOptions } from '../../../constants/hsOptions';
import AUTH_TYPE from '../../../constants/authType';

import {
  BasicHeader,
  TextInput,
  TransferFormItem,
  MainButton,
  DropdownButton,
  UserAvatar,
  Icon,
  Modal,
} from '../../../components';

import styles from './transferStyles';
import { OptionsModal } from '../../../components/atoms';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

class TransferTokenView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentAccountName,
      destination: '',
      amount: '',
      steemConnectTransfer: false,
      isTransfering: false,
    };
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

            this.setState({ isUsernameValid: isValid });
          });
          this.setState({ [key]: value });
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
    const { from, destination, amount, memo } = this.state;

    this.setState({ isTransfering: true });

    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      this.setState({ steemConnectTransfer: true });
    } else {
      transferToAccount(from, destination, amount, memo);
    }
  };

  _handleOnAmountChange = (state, amount) => {
    let _amount = amount.toString();
    if (_amount.includes(',')) {
      _amount = amount.replace(',', '.');
    }

    this._setState(state, _amount);
  };

  _renderInput = (placeholder, state, keyboardType, isTextArea) => (
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

  _handleOnDropdownChange = (value) => {
    const { fetchBalance, transferType } = this.props;

    fetchBalance(value);
    this.setState({ from: value });
    if (transferType === 'convert') {
      this.setState({ destination: value });
    }
  };

  _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;

  render() {
    const {
      accounts,
      intl,
      handleOnModalClose,
      balance,
      fundType,
      transferType,
      currentAccountName,
      selectedAccount,
    } = this.props;
    const {
      destination,
      isUsernameValid,
      amount,
      steemConnectTransfer,
      memo,
      isTransfering,
      from,
    } = this.state;
    let path;

    if (transferType === 'points') {
      const json = JSON.stringify({
        sender: get(selectedAccount, 'name'),
        receiver: destination,
        amount: `${Number(amount).toFixed(3)} ${fundType}`,
        memo,
      });
      path = `sign/custom-json?authority=active&required_auths=%5B%22${get(
        selectedAccount,
        'name',
      )}%22%5D&required_posting_auths=%5B%5D&id=ecency_point_transfer&json=${encodeURIComponent(
        json,
      )}`;
    } else {
      path = `sign/transfer?from=${
        accounts[0].username
      }&to=${destination}&amount=${encodeURIComponent(
        `${amount} ${fundType}`,
      )}&memo=${encodeURIComponent(memo)}`;
    }

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: `transfer.${transferType}` })} />
        <View style={styles.container}>
          <ScrollView>
            <View style={[styles.toFromAvatarsContainer, { marginBottom: 16 }]}>
              <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
              <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
              <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
            </View>
            <View style={styles.middleContent}>
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.from' })}
                rightComponent={() => this._renderDropdown(accounts, currentAccountName)}
              />
              {transferType !== 'convert' && (
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
              )}
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.amount' })}
                rightComponent={() =>
                  this._renderInput(
                    intl.formatMessage({ id: 'transfer.amount' }),
                    'amount',
                    'numeric',
                  )
                }
              />
              <TransferFormItem
                rightComponent={() => (
                  <TouchableOpacity onPress={() => this._handleOnAmountChange('amount', balance)}>
                    {this._renderDescription(
                      `${intl.formatMessage({
                        id: 'transfer.amount_desc',
                      })} ${balance} ${fundType}`,
                    )}
                  </TouchableOpacity>
                )}
              />
              {(transferType === 'points' || transferType === 'transfer_token') && (
                <TransferFormItem
                  label={intl.formatMessage({ id: 'transfer.memo' })}
                  rightComponent={() =>
                    this._renderInput(
                      intl.formatMessage({ id: 'transfer.memo_placeholder' }),
                      'memo',
                      'default',
                      true,
                    )
                  }
                />
              )}
              {(transferType === 'points' || transferType === 'transfer_token') && (
                <TransferFormItem
                  rightComponent={() =>
                    this._renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
                  }
                />
              )}
              {transferType === 'convert' && (
                <TransferFormItem
                  rightComponent={() =>
                    this._renderDescription(intl.formatMessage({ id: 'transfer.convert_desc' }))
                  }
                />
              )}
            </View>
            <View style={styles.bottomContent}>
              <MainButton
                style={styles.button}
                isDisable={!(amount >= 0.001 && isUsernameValid)}
                onPress={() => this.ActionSheet.show()}
                isLoading={isTransfering}
              >
                <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
              </MainButton>
            </View>
          </ScrollView>
        </View>
        <OptionsModal
          ref={(o) => (this.ActionSheet = o)}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'transfer.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={(index) => {
            index === 0 ? this._handleTransferAction() : null;
          }}
        />
        {path && (
          <Modal
            isOpen={steemConnectTransfer}
            isFullScreen
            isCloseButton
            handleOnModalClose={handleOnModalClose}
            title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
          >
            <WebView source={{ uri: `${hsOptions.base_url}${path}` }} />
          </Modal>
        )}
      </Fragment>
    );
  }
}

export default injectIntl(TransferTokenView);
