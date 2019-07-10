/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, WebView, ScrollView, TouchableOpacity } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import Slider from 'react-native-slider';

// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TextInput } from '../../../components/textInput';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
// import { Modal } from '../../../components/modal';

// Styles
import styles from './promoteStyles';

class PointsScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      permlink: '',
      selectedUser: props.currentAccountName,
    };
  }

  // Component Life Cycles

  // Component Functions

  _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={val => this._handleOnAmountChange(state, val)}
      value={this.state[state]}
      placeholder={placeholder}
      placeholderTextColor="#c1c5c7"
      autoCapitalize="none"
      multiline={isTextArea}
      numberOfLines={isTextArea ? 4 : 1}
      keyboardType={keyboardType}
    />
  );

  _renderDescription = text => <Text style={styles.description}>{text}</Text>;

  _renderDropdown = (accounts, currentAccountName, getUserBalance) => (
    <DropdownButton
      dropdownButtonStyle={styles.dropdownButtonStyle}
      rowTextStyle={styles.rowTextStyle}
      style={styles.dropdown}
      dropdownStyle={styles.dropdownStyle}
      textStyle={styles.dropdownText}
      options={accounts.map(item => item.username)}
      defaultText={currentAccountName}
      selectedOptionIndex={accounts.findIndex(item => item.username === currentAccountName)}
      onSelect={(index, value) => {
        this.setState({ selectedUser: value });
        getUserBalance(value);
      }}
    />
  );

  render() {
    const { intl } = this.props;

    return (
      <PointsContainer>
        {({
          handleOnPressTransfer,
          claimPoints,
          fetchUserActivity,
          isLoading,
          refreshing,
          accounts,
          currentAccountName,
          balance,
          getUserBalance,
        }) => (
          <Fragment>
            <BasicHeader title="Promote" />
            <View style={styles.container}>
              <ScrollView>
                <View style={styles.middleContent}>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'promote.user' })}
                    rightComponent={() =>
                      this._renderDropdown(accounts, currentAccountName, getUserBalance)
                    }
                  />
                  <Text style={styles.balanceText}>{`${balance} eSteem Points`}</Text>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'transfer.amount' })}
                    rightComponent={() =>
                      this._renderInput(
                        intl.formatMessage({ id: 'promote.permlink' }),
                        'permlink',
                        'default',
                      )
                    }
                  />
                  <TransferFormItem
                    rightComponent={() => (
                      <TouchableOpacity
                        onPress={() => this._handleOnAmountChange('amount', balance)}
                      >
                        {this._renderDescription(
                          `${intl.formatMessage({
                            id: 'transfer.amount_desc',
                          })}`,
                        )}
                      </TouchableOpacity>
                    )}
                  />
                  {/* <TransferFormItem
                rightComponent={() =>
                  this._renderDescription(intl.formatMessage({ id: 'transfer.memo_desc' }))
                }
              /> */}
                  {/* <Slider
                    style={styles.slider}
                    trackStyle={styles.track}
                    thumbStyle={styles.thumb}
                    minimumTrackTintColor="#357ce6"
                    thumbTintColor="#007ee5"
                    maximumValue={10000}
                    value={100}
                    onValueChange={val => {
                      this.setState({ amount: val });
                    }}
                  /> */}
                </View>
                <View style={styles.bottomContent}>
                  <MainButton
                    style={styles.button}
                    isDisable={false}
                    onPress={() => this.ActionSheet.show()}
                    isLoading={false}
                  >
                    <Text style={styles.buttonText}>
                      {intl.formatMessage({ id: 'transfer.next' })}
                    </Text>
                  </MainButton>
                </View>
              </ScrollView>
            </View>
            {/* <ActionSheet
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
            /> */}
            {/* <Modal
          isOpen={steemConnectTransfer}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
        <WebView source={{ uri: `${steemConnectOptions.base_url}${path}` }} />
        </Modal> */}
          </Fragment>
        )}
      </PointsContainer>
    );
  }
}

export default injectIntl(PointsScreen);
