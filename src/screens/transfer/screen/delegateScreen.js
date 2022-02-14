import React, { Component, Fragment } from 'react';
import { View, Text, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { WebView } from 'react-native-webview';
import { injectIntl } from 'react-intl';
import Slider from '@esteemapp/react-native-slider';
import get from 'lodash/get';
import { View as AnimatedView } from 'react-native-animatable';
import { TouchableOpacity, FlatList } from 'react-native-gesture-handler';

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
// Styles
import styles from './transferStyles';
import { OptionsModal } from '../../../components/atoms';
//  Redux
import { showActionModal } from '../../../redux/actions/uiAction';
// Utils
import { getReceivedVestingShares } from '../../../providers/ecency/ecency';
import parseToken from '../../../utils/parseToken';
import { isEmptyDate } from '../../../utils/time';
import { hpToVests, vestsToHp } from '../../../utils/conversions';
import parseAsset from '../../../utils/parseAsset';

class DelegateScreen extends Component {
  _handleOnAmountChange = debounce(
    async (state, amount) => {
      let _amount = amount.toString();
      if (_amount.includes(',')) {
        _amount = amount.replace(',', '.');
      }

      this._setState(state, _amount);
    },
    1000,
    { leading: true },
  );

  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      isAmountValid: true,
      hp: 0.0,
      isTransfering: false,
      from: props.currentAccountName,
      destination: '',
      steemConnectTransfer: false,
      usersResult: [],
      step: 1,
      delegatedHP: 0,
    };

    this.startActionSheet = React.createRef();
    this.destinationTextInput = React.createRef();
    this.amountTextInput = React.createRef();
  }

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
          if (parseFloat(value) <= parseFloat(balance)) {
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
      this.setState({ step: 2, hp: 0.0, amount: 0, isAmountValid: false });
      return;
    }
    const parsedValue = parseFloat(hp);
    const { hivePerMVests } = this.props;
    const vestsForHp = hpToVests(hp, hivePerMVests);
    const totalHP = vestsToHp(availableVests, hivePerMVests).toFixed(3);
    if (Number.isNaN(parsedValue)) {
      this.setState({ amount: 0, hp: 0.0, step: 2, isAmountValid: false });
    } else if (parsedValue >= totalHP) {
      this.setState({
        amount: hpToVests(totalHP, hivePerMVests),
        hp: totalHP,
        step: 2,
        isAmountValid: false,
      });
    } else {
      this.setState({ amount: vestsForHp, hp: parsedValue, step: 2, isAmountValid: true });
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

  _fetchReceivedVestingShare = async () => {
    try {
      const { hivePerMVests } = this.props;
      const delegateeUser = this.state.destination;
      const vestingShares = await getReceivedVestingShares(delegateeUser);
      if (vestingShares && vestingShares.length) {
        const curShare = vestingShares.find((item) => item.delegator === this.state.from);
        if (curShare) {
          const vest_shares = parseAsset(curShare.vesting_shares);
          this.setState({
            delegatedHP: vestsToHp(vest_shares.amount, hivePerMVests).toFixed(3),
          });
        }
      } else {
        this.setState({
          delegatedHP: 0,
        });
      }
    } catch (err) {
      console.warn(err);
    }
  };

  _handleOnDropdownChange = (value) => {
    const { fetchBalance } = this.props;

    fetchBalance(value);
    this.setState({ from: value, amount: 0 });
  };

  _handleSliderValueChange = (value, availableVestingShares) => {
    const { hivePerMVests } = this.props;
    if (value === availableVestingShares) {
      this.setState({ isAmountValid: false });
    }
    if (value !== availableVestingShares) {
      this.setState({
        step: 2,
        isAmountValid: true,
        amount: value,
        hp: vestsToHp(value, hivePerMVests).toFixed(3),
      });
    } else {
      this.setState({ amount: value, hp: vestsToHp(value, hivePerMVests).toFixed(3), step: 2 });
    }
  };

  _handleNext = () => {
    const { step, hp, amount, destination, from, delegatedHP } = this.state;
    const { dispatch, intl } = this.props;
    if (step === 1) {
      // this.setState({ step: 2 });
    } else {
      // this.amountTextInput.current.blur();
      dispatch(
        showActionModal(
          intl.formatMessage({ id: 'transfer.confirm' }),
          intl.formatMessage(
            { id: 'transfer.confirm_summary' },
            {
              hp: hp,
              vests: amount.toFixed(3),
              delegatee: from,
              delegator: destination,
            },
          ),
          intl.formatMessage(
            { id: 'transfer.confirm_summary_para' },
            {
              prev: delegatedHP,
            },
          ),
          [
            {
              text: intl.formatMessage({ id: 'alert.cancel' }),
              onPress: () => console.log('Cancel'),
            },
            {
              text: intl.formatMessage({ id: 'alert.confirm' }),
              onPress: () => this._handleTransferAction(),
            },
          ],
          this._renderToFromAvatars(),
        ),
      );
    }
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
          this._fetchReceivedVestingShare();
          this.setState({ destination: username, usersResult: [], step: 2 });
          this.destinationTextInput.current?.blur();
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
              style={[styles.input]}
              onChangeText={(value) => {
                this.setState({ destination: value, step: 1 });
                this._handleOnAmountChange(state, value);
              }}
              value={this.state[state]}
              placeholder={placeholder}
              placeholderTextColor="#c1c5c7"
              autoCapitalize="none"
              multiline={isTextArea}
              numberOfLines={isTextArea ? 4 : 1}
              keyboardType={keyboardType}
              autoFocus={true}
              innerRef={this.destinationTextInput}
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
            value={this.state.hp}
            placeholder={placeholder}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            multiline={isTextArea}
            numberOfLines={isTextArea ? 4 : 1}
            keyboardType={keyboardType}
            innerRef={this.amountTextInput}
            blurOnSubmit={false}
          />
        );
      default:
        null;
        break;
    }
  };

  _renderInformationText = (text) => <Text style={styles.amountText}>{text}</Text>;

  _renderToFromAvatars = () => {
    const { destination, from } = this.state;
    return (
      <View style={styles.toFromAvatarsContainer}>
        <UserAvatar username={from} size="xl" style={styles.userAvatar} noAction />
        <Icon style={styles.icon} name="arrow-forward" iconType="MaterialIcons" />
        <UserAvatar username={destination} size="xl" style={styles.userAvatar} noAction />
      </View>
    );
  };
  render() {
    const {
      intl,
      accounts,
      currentAccountName,
      selectedAccount,
      handleOnModalClose,
      hivePerMVests,
      actionModalVisible,
      accountType,
    } = this.props;
    const {
      amount,
      isTransfering,
      from,
      destination,
      steemConnectTransfer,
      step,
      delegatedHP,
      hp,
      isAmountValid,
    } = this.state;
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
    const totalHP = vestsToHp(availableVestingShares, hivePerMVests);
    const _renderSlider = () => (
      <View style={styles.sliderBox}>
        <View style={styles.emptyBox} />
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            trackStyle={styles.track}
            thumbStyle={styles.thumb}
            minimumTrackTintColor="#357ce6"
            thumbTintColor="#007ee5"
            maximumValue={availableVestingShares}
            value={amount}
            onValueChange={(value) => this._handleSliderValueChange(value, availableVestingShares)}
          />
          <View style={styles.sliderAmountContainer}>
            <Text style={styles.amountText}>{`MAX  ${totalHP.toFixed(3)} HP`}</Text>
          </View>
        </View>
      </View>
    );
    const _renderStepOne = () => (
      <View style={styles.stepOneContainer}>
        <Text style={styles.sectionHeading}>
          {intl.formatMessage({ id: 'transfer.account_detail_head' })}
        </Text>
        <Text style={styles.sectionSubheading}>
          {intl.formatMessage({ id: 'transfer.account_detail_subhead' })}
        </Text>
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
          containerStyle={styles.elevate}
        />
        {this._renderToFromAvatars()}
      </View>
    );
    const _renderStepTwo = () => (
      <AnimatedView animation="bounceInRight" delay={500} useNativeDriver>
        <View style={styles.stepTwoContainer}>
          <Text style={styles.sectionHeading}>
            {intl.formatMessage({ id: 'transfer.delegat_detail_head' })}
          </Text>
          <Text style={styles.sectionSubheading}>
            {intl.formatMessage({ id: 'transfer.delegat_detail_subhead' })}
          </Text>
          <View style={styles.alreadyDelegateRow}>
            <Text style={styles.sectionSubheading}>
              {`${intl.formatMessage({ id: 'transfer.already_delegated' })} @${destination}`}
            </Text>
            <Text style={styles.sectionSubheading}>{`${delegatedHP} HP`}</Text>
          </View>
          <TransferFormItem
            label={intl.formatMessage({ id: 'transfer.new_amount' })}
            rightComponent={() =>
              this._renderInput(
                intl.formatMessage({ id: 'transfer.amount' }),
                'amount',
                'decimal-pad',
                availableVestingShares,
              )
            }
            containerStyle={styles.paddBottom}
          />
          {_renderSlider()}
        </View>
      </AnimatedView>
    );
    const _renderMainBtn = () => (
      <View style={styles.stepThreeContainer}>
        <MainButton
          style={styles.button}
          onPress={this._handleNext}
          isLoading={isTransfering}
          isDisable={!isAmountValid}
        >
          <Text style={styles.buttonText}>
            {step === 2
              ? intl.formatMessage({ id: 'transfer.review' })
              : intl.formatMessage({ id: 'transfer.next' })}
          </Text>
        </MainButton>
      </View>
    );

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'transfer.delegate' })} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.fillSpace}
          keyboardShouldPersistTaps
        >
          <ScrollView keyboardShouldPersistTaps contentContainerStyle={styles.grow}>
            <View style={styles.container}>
              {step >= 1 && _renderStepOne()}
              {step >= 2 && _renderStepTwo()}

              {_renderMainBtn()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
