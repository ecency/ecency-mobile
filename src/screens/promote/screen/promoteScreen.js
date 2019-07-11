/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */
/* eslint-disable no-return-assign */
import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, WebView, ScrollView } from 'react-native';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';
import { ScaleSlider } from '../../../components';

// Container
import { PointsContainer } from '../../../containers';

// Services and Actions
import { getUser } from '../../../providers/esteem/ePoint';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TextInput } from '../../../components/textInput';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
// import { Modal } from '../../../components/modal';

import { PROMOTE_PRICING, PROMOTE_DAYS } from '../../../constants/options/points';

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
      selectedUser: '',
      balance: '',
      day: 1,
    };
  }

  // Component Life Cycles

  // Component Functions

  _renderInput = (placeholder, state, keyboardType, isTextArea) => (
    <TextInput
      style={[isTextArea ? styles.textarea : styles.input]}
      onChangeText={val => this.setState({ permlink: val })}
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
      onSelect={(index, value) => {
        this.setState({ selectedUser: value });
        this._getUserBalance(value);
      }}
    />
  );

  _getUserBalance = async username => {
    await getUser(username)
      .then(userPoints => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ balance });
      })
      .catch(err => {
        Alert.alert(err);
      });
  };

  _promote = promote => {
    const { day, permlink, author } = this.state;
    // @u-e/esteem-mobile-v2-guide
    if (promote) promote(day, permlink, 'u-e');
  };

  render() {
    const { intl } = this.props;
    const { selectedUser, balance, day } = this.state;

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
          balance: _balance,
          promote,
        }) => (
          <Fragment>
            <BasicHeader title="Promote" />
            <View style={styles.container}>
              <ScrollView>
                <View style={styles.middleContent}>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'promote.user' })}
                    rightComponent={() =>
                      this._renderDropdown(accounts, selectedUser || currentAccountName)
                    }
                  />
                  <Text style={styles.balanceText}>{`${balance || _balance} eSteem Points`}</Text>
                  <TransferFormItem
                    label={intl.formatMessage({ id: 'promote.permlink' })}
                    rightComponent={() =>
                      this._renderInput(
                        intl.formatMessage({ id: 'promote.permlink' }),
                        'permlink',
                        'default',
                      )
                    }
                  />

                  <View style={styles.total}>
                    <Text style={styles.day}>{`${day} days `}</Text>
                    <Text style={styles.price}>
                      {`${get(PROMOTE_PRICING[PROMOTE_DAYS.indexOf(day)], 'price')} eSteem points`}
                    </Text>
                  </View>

                  <ScaleSlider
                    values={[1, 2, 3, 7, 14]}
                    LRpadding={50}
                    activeValue={day}
                    handleOnValueChange={day => this.setState({ day })}
                    single
                  />
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
            <ActionSheet
              ref={o => (this.ActionSheet = o)}
              options={[
                intl.formatMessage({ id: 'alert.confirm' }),
                intl.formatMessage({ id: 'alert.cancel' }),
              ]}
              title={intl.formatMessage({ id: 'promote.information' })}
              cancelButtonIndex={1}
              destructiveButtonIndex={0}
              onPress={index => {
                index === 0 ? this._promote(promote) : null;
              }}
            />
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
