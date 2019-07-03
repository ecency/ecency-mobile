import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Slider from 'react-native-slider';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { TransferFormItem } from '../../../components/transferFormItem';
import CheckBox from '../../../components/checkbox';
import { MainButton } from '../../../components/mainButton';
import { TextInput } from '../../../components/textInput';
import { UserAvatar } from '../../../components/userAvatar';

// Styles
import styles from './transferStyles';

class WithdrawAccountModal extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      percent: 25,
      autoPowerUp: false,
      account: '',
      isValidUsername: false,
    };
  }

  // Component Life Cycles

  // Component Functions

  _checkValidUsers = username => {
    const { getAccountsWithUsername } = this.props;

    getAccountsWithUsername(username).then(res => {
      const isValid = res.includes(username);

      this.setState({ isValidUsername: isValid });
    });
  };

  _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={value => this.setState({ [state]: value }, this._checkValidUsers(value))}
      value={this.state[state]}
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      multiline={isTextArea}
      numberOfLines={isTextArea ? 4 : 1}
      keyboardType={keyboardType}
    />
  );

  _renderInformationText = text => <Text style={styles.amountText}>{text}</Text>;

  render() {
    const { intl, handleOnSubmit } = this.props;
    const { percent, autoPowerUp, account, isValidUsername } = this.state;

    const isValidForm = isValidUsername && percent > 0;

    return (
      <View style={styles.modalContainer}>
        <UserAvatar username={account} size="xl" style={styles.avatar} noAction />
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.to' })}
          rightComponent={() =>
            this._renderInput(
              intl.formatMessage({ id: 'transfer.to_placeholder' }),
              'account',
              'default',
            )
          }
        />
        <TransferFormItem
          label={intl.formatMessage({ id: 'transfer.amount' })}
          rightComponent={() => this._renderInformationText(`${percent.toFixed(0)} %`)}
        />
        <View style={styles.informationView}>
          <Slider
            style={styles.slider}
            trackStyle={styles.track}
            thumbStyle={styles.thumb}
            minimumTrackTintColor="#357ce6"
            thumbTintColor="#007ee5"
            maximumValue={100}
            value={percent}
            onValueChange={value => {
              this.setState({ percent: value });
            }}
          />
        </View>
        <Text style={styles.informationText}>Drag the sliderto adjust to amount</Text>
        <TouchableOpacity onPress={() => this.setState({ autoPowerUp: !autoPowerUp })}>
          <View style={styles.checkView}>
            <CheckBox locked isChecked={autoPowerUp} />
            <Text style={styles.informationText}>Drag the sliderto adjust to amount</Text>
          </View>
        </TouchableOpacity>
        <MainButton
          isDisable={!isValidForm}
          style={styles.button}
          onPress={() => handleOnSubmit(account, percent, autoPowerUp)}
        >
          <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
        </MainButton>
      </View>
    );
  }
}

export default injectIntl(WithdrawAccountModal);
