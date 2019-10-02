import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';
import Autocomplete from 'react-native-autocomplete-input';
import { ScaleSlider, TextInput } from '..';
import { steemConnectOptions } from '../../constants/steemConnectOptions';

// Services and Actions
import { getUser } from '../../providers/esteem/ePoint';
import { searchPath } from '../../providers/esteem/esteem';

// Components
import { BasicHeader } from '../basicHeader';
import { TransferFormItem } from '../transferFormItem';
import { MainButton } from '../mainButton';
import { DropdownButton } from '../dropdownButton';
import { Modal } from '../modal';

import { PROMOTE_PRICING, PROMOTE_DAYS } from '../../constants/options/points';

// Styles
import styles from './promoteStyles';

class PromoteView extends PureComponent {
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
      permlinkSuggestions: [],
      isValid: false,
    };

    this.startActionSheet = React.createRef();
  }

  // Component Life Cycles

  // Component Functions

  _handleOnPermlinkChange = async text => {
    this.setState({ permlink: text, isValid: false });

    if (this.timer) {
      clearTimeout(this.timer);
    }

    if (text.trim().length < 3) {
      this.setState({ permlinkSuggestions: [] });
      return;
    }

    if (text && text.length > 0) {
      this.timer = setTimeout(
        () =>
          searchPath(text).then(res => {
            this.setState({ permlinkSuggestions: res && res.length > 10 ? res.slice(0, 7) : res });
          }),
        500,
      );
    } else {
      await this.setState({ permlinkSuggestions: [], isValid: false });
    }
  };

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
        this.setState({ selectedUser: value }, () => {
          this._getUserBalance(value);
        });
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
        Alert.alert(err.message || err.toString());
      });
  };

  _handleOnSubmit = async () => {
    const { handleOnSubmit, redeemType, navigationParams } = this.props;
    const { day, permlink, selectedUser } = this.state;
    const fullPermlink = permlink || get(navigationParams, 'permlink');

    handleOnSubmit(redeemType, day, fullPermlink, selectedUser);
  };

  render() {
    const { intl } = this.props;
    const { selectedUser, balance, day, permlinkSuggestions, permlink, isValid } = this.state;

    const {
      isLoading,
      accounts,
      currentAccountName,
      balance: _balance,
      navigationParams,
      SCPath,
      isSCModalOpen,
      handleOnSCModalClose,
    } = this.props;

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'promote.title' })} />
        <View style={styles.container}>
          <ScrollView>
            <View style={styles.middleContent}>
              <TransferFormItem
                label={intl.formatMessage({ id: 'promote.user' })}
                rightComponent={() =>
                  this._renderDropdown(accounts, selectedUser || currentAccountName)
                }
              />
              <Text style={styles.balanceText}>{`${balance || _balance} ESTM`}</Text>
              <Fragment>
                <View style={styles.autocomplateLineContainer}>
                  <View style={styles.autocomplateLabelContainer}>
                    {
                      <Text style={styles.autocomplateLabelText}>
                        {intl.formatMessage({ id: 'promote.permlink' })}
                      </Text>
                    }
                  </View>

                  <Autocomplete
                    autoCapitalize="none"
                    autoCorrect={false}
                    inputContainerStyle={styles.autocomplate}
                    data={permlinkSuggestions}
                    listContainerStyle={styles.autocomplateListContainer}
                    listStyle={styles.autocomplateList}
                    onChangeText={text => this._handleOnPermlinkChange(text)}
                    renderTextInput={() => (
                      <TextInput
                        style={styles.input}
                        onChangeText={text => this._handleOnPermlinkChange(text)}
                        value={permlink || get(navigationParams, 'permlink', '')}
                        placeholder={intl.formatMessage({ id: 'promote.permlink' })}
                        placeholderTextColor="#c1c5c7"
                        autoCapitalize="none"
                      />
                    )}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        key={item}
                        onPress={() =>
                          this.setState({
                            permlink: item,
                            isValid: true,
                            permlinkSuggestions: [],
                          })
                        }
                      >
                        <Text style={styles.autocomplateItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </Fragment>

              <View style={styles.total}>
                <Text style={styles.day}>
                  {`${day} ${intl.formatMessage({
                    id: 'promote.days',
                  })} `}
                </Text>
                <Text style={styles.price}>
                  {`${get(PROMOTE_PRICING[PROMOTE_DAYS.indexOf(day)], 'price')} eSteem points`}
                </Text>
              </View>

              <ScaleSlider
                values={[1, 2, 3, 7, 14]}
                LRpadding={50}
                activeValue={day}
                handleOnValueChange={_day => this.setState({ day: _day })}
                single
              />
            </View>
            <View style={styles.bottomContent}>
              <MainButton
                style={styles.button}
                isDisable={
                  (!permlink ? !get(navigationParams, 'permlink') : permlink) &&
                  (isLoading || !isValid)
                }
                onPress={() => this.startActionSheet.current.show()}
                isLoading={isLoading}
              >
                <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
              </MainButton>
            </View>
          </ScrollView>
        </View>
        <ActionSheet
          ref={this.startActionSheet}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'promote.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => {
            if (index === 0) this._handleOnSubmit();
          }}
        />
        <Modal
          isOpen={isSCModalOpen}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnSCModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${steemConnectOptions.base_url}${SCPath}` }} />
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(PromoteView);
