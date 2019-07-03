import React, { Fragment, Component } from 'react';
import { Text, View, WebView, ScrollView, Alert } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';
import Slider from 'react-native-slider';
import get from 'lodash/get';

import { getWithdrawRoutes } from '../../../providers/steem/dsteem';
import { steemConnectOptions } from '../../../constants/steemConnectOptions';
import AUTH_TYPE from '../../../constants/authType';

import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { Modal } from '../../../components/modal';
import { SquareButton } from '../../../components/buttons';
import InformationBox from '../../../components/informationBox';
import { Icon } from '../../../components/icon';
import { IconButton } from '../../../components/iconButton';
import parseToken from '../../../utils/parseToken';
import { vestsToSp } from '../../../utils/conversions';
import WithdrawAccountModal from './withdrawAccountModal';

import styles from './transferStyles';
/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */

class PowerDownView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      from: props.currentAccountName,
      amount: 0,
      steemConnectTransfer: false,
      isTransfering: false,
      isOpenWithdrawAccount: false,
      destinationAccounts: [],
    };
  }

  // Component Life Cycles
  componentWillMount() {
    const { currentAccountName } = this.props;

    this._fetchRoutes(currentAccountName);
  }

  // Component Functions

  _fetchRoutes = username => {
    return getWithdrawRoutes(username)
      .then(res => {
        const accounts = res.map(item => ({
          username: item.to_account,
          percent: item.percent,
          autoPowerUp: item.auto_vest,
        }));
        this.setState({
          destinationAccounts: accounts,
        });
        return res;
      })
      .catch(e => {
        alert(e);
      });
  };

  _handleTransferAction = () => {
    const { transferToAccount, accountType } = this.props;
    const { from, destinationAccounts, amount } = this.state;

    this.setState({ isTransfering: true });

    if (accountType === AUTH_TYPE.STEEM_CONNECT) {
      this.setState({ steemConnectTransfer: true });
    } else {
      transferToAccount(from, destinationAccounts, amount, '');
    }
  };

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

  _renderDestinationAccountItems = () => {
    const { destinationAccounts } = this.state;

    if (destinationAccounts.length <= 0) {
      return this._renderButton();
    }
    return (
      <View>
        {destinationAccounts.map(item => (
          <View style={styles.destinationAccountsLists} key={item.username}>
            <Text>{item.username}</Text>
            <IconButton
              style={styles.iconButton}
              size={20}
              iconStyle={styles.crossIcon}
              iconType="MaterialIcons"
              name="clear"
              onPress={() => this._removeDestinationAccount(item)}
            />
          </View>
        ))}
        {this._renderButton()}
      </View>
    );
  };

  _removeDestinationAccount = account => {
    const { destinationAccounts } = this.state;
    const { setWithdrawVestingRoute, currentAccountName } = this.props;

    const result = destinationAccounts.filter(item => item.username !== account.username);

    setWithdrawVestingRoute(currentAccountName, account.username, 0, false);
    this.setState({ destinationAccounts: result });
  };

  _renderButton = () => (
    <SquareButton
      style={styles.formButton}
      textStyle={styles.formButtonText}
      onPress={() => this.setState({ isOpenWithdrawAccount: true })}
      text="Add withdraw account"
    />
  );

  _renderInformationText = text => <Text style={styles.amountText}>{text}</Text>;

  _handleOnDropdownChange = value => {
    const { fetchBalance } = this.props;

    fetchBalance(value);
    this._fetchRoutes(value);
    this.setState({ from: value, amount: 0 });
  };

  _renderDescription = text => <Text style={styles.description}>{text}</Text>;

  _handleOnSubmit = (username, percent, autoPowerUp) => {
    const { destinationAccounts } = this.state;
    const { setWithdrawVestingRoute, currentAccountName } = this.props;

    if (!destinationAccounts.some(item => item.username === username)) {
      destinationAccounts.push({ username, percent, autoPowerUp });
      setWithdrawVestingRoute(currentAccountName, username, percent, autoPowerUp);
      this.setState({
        isOpenWithdrawAccount: false,
        destinationAccounts,
      });
    } else {
      Alert.alert('Opps!', 'same username');
    }
  };

  render() {
    const {
      accounts,
      selectedAccount,
      intl,
      handleOnModalClose,
      getAccountsWithUsername,
      transferType,
      currentAccountName,
      steemPerMVests,
    } = this.props;
    const { amount, steemConnectTransfer, isTransfering, isOpenWithdrawAccount } = this.state;
    let path;

    const availableVestingShares =
      parseToken(get(selectedAccount, 'vesting_shares')) -
      (Number(get(selectedAccount, 'to_withdraw')) - Number(get(selectedAccount, 'withdrawn'))) /
        1e6 -
      parseToken(get(selectedAccount, 'delegated_vesting_shares'));

    const spCalculated = vestsToSp(amount, steemPerMVests);
    const fundPerWeek = Math.round((spCalculated / 13) * 1000) / 1000;

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: `transfer.${transferType}` })} />
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.middleContent}>
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.from' })}
                rightComponent={() => this._renderDropdown(accounts, currentAccountName)}
              />
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.from' })}
                rightComponent={this._renderDestinationAccountItems}
              />
              <TransferFormItem
                label={intl.formatMessage({ id: 'transfer.amount' })}
                rightComponent={() => this._renderInformationText(`${amount.toFixed(6)} VESTS`)}
              />
              <Slider
                style={styles.slider}
                trackStyle={styles.track}
                thumbStyle={styles.thumb}
                minimumTrackTintColor="#357ce6"
                thumbTintColor="#007ee5"
                maximumValue={availableVestingShares}
                value={amount}
                onValueChange={value => {
                  this.setState({ amount: value });
                }}
              />
              <Text style={styles.informationText}>Drag the sliderto adjust to amount</Text>
            </View>
            <View style={styles.bottomContent}>
              <View style={styles.informationView}>
                <InformationBox
                  style={styles.spInformation}
                  text={`- ${spCalculated.toFixed(3)} SP`}
                />
                <InformationBox
                  style={styles.vestsInformation}
                  text={`- ${amount.toFixed(0)} VESTS`}
                />
              </View>
              <Icon style={styles.icon} size={40} iconType="MaterialIcons" name="arrow-downward" />
              <InformationBox
                style={styles.steemInformation}
                text={`+ ${fundPerWeek.toFixed(3)} STEEM`}
              />
              <MainButton
                style={styles.button}
                isDisable={amount <= 0}
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
          isOpen={isOpenWithdrawAccount}
          isCloseButton
          isFullScreen
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
          handleOnModalClose={() => this.setState({ isOpenWithdrawAccount: false })}
        >
          <WithdrawAccountModal
            getAccountsWithUsername={getAccountsWithUsername}
            handleOnSubmit={this._handleOnSubmit}
          />
        </Modal>
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

export default injectIntl(PowerDownView);
