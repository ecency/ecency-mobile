/* eslint-disable no-restricted-globals */
import React, { Fragment, Component } from 'react';
import { Text, View, WebView, ScrollView, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';

import { steemConnectOptions } from '../../../constants/steemConnectOptions';
import AUTH_TYPE from '../../../constants/authType';

import { BasicHeader } from '../../../components/basicHeader';
import { TextInput } from '../../../components/textInput';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { UserAvatar } from '../../../components/userAvatar';
import { Icon } from '../../../components/icon';
import { Modal } from '../../../components/modal';

import styles from './transferStyles';
/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

class TransferView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentAccountName,
      destination: '',
      amount: '',
      memo: '',
      isUsernameValid: false,
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
          getAccountsWithUsername(value).then(res => {
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
      onChangeText={amount => this._handleOnAmountChange(state, amount)}
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
      options={accounts.map(item => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex(item => item.username === currentAccountName)}
      onSelect={(index, value) => this._handleOnDropdownChange(value)}
    />
  );

  _handleOnDropdownChange = value => {
    const { fetchBalance } = this.props;

    fetchBalance(value);
    this.setState({ from: value });
  };

  _renderDescription = text => <Text style={styles.description}>{text}</Text>;

  render() {
    const {
      accounts,
      intl,
      handleOnModalClose,
      balance,
      fundType,
      transferType,
      currentAccountName,
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

    const path = `sign/transfer?from=${
      accounts[0].username
    }&to=${destination}&amount=${encodeURIComponent(`${amount} STEEM`)}&memo=${encodeURIComponent(
      memo,
    )}`;

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: `transfer.${transferType}` })} />
        <View style={styles.container}>
          <ScrollView>
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
              />
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
              <TransferFormItem
                rightComponent={() =>
                  this._renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
                }
              />
            </View>
            <View style={styles.bottomContent}>
              <MainButton
                style={styles.button}
                isDisable={!(amount && isUsernameValid)}
                onPress={() => this.ActionSheet.show()}
                isLoading={isTransfering}
              >
                <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
              </MainButton>
            </View>
          </ScrollView>
        </View>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'transfer.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => {
            index === 0 ? this._handleTransferAction() : null;
          }}
        />
        <Modal
          isOpen={steemConnectTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${steemConnectOptions.base_url}${path}` }} />
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(TransferView);
