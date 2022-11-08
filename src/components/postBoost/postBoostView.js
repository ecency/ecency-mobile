import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import Autocomplete from '@esteemapp/react-native-autocomplete-input';
import { Icon, TextInput } from '..';
import { hsOptions } from '../../constants/hsOptions';

// Services and Actions
import { getPointsSummary } from '../../providers/ecency/ePoint';
import { searchPath } from '../../providers/ecency/ecency';

// Components
import { BasicHeader } from '../basicHeader';
import { TransferFormItem } from '../transferFormItem';
import { MainButton } from '../mainButton';
import { DropdownButton } from '../dropdownButton';
import { Modal } from '../modal';

// Styles
import styles from './postBoostStyles';
import { OptionsModal } from '../atoms';
import postUrlParser from '../../utils/postUrlParser';

class BoostPostScreen extends PureComponent {
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
      factor: 0,
      permlinkSuggestions: [],
      isValid: false,
    };

    this.startActionSheet = React.createRef();
    this.urlInputRef = React.createRef();
  }

  // Component Life Cycles

  // Component Functions

  _handleOnPermlinkChange = async (text) => {
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
          searchPath(text).then((res) => {
            this.setState({ permlinkSuggestions: res && res.length > 10 ? res.slice(0, 7) : res });
          }),
        500,
      );
    } else {
      await this.setState({ permlinkSuggestions: [], isValid: false });
    }
  };

  _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;

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
      onSelect={(index, value) => {
        this.setState({ selectedUser: value }, () => {
          this._getUserBalance(value);
        });
      }}
    />
  );

  _getUserBalance = async (username) => {
    await getPointsSummary(username)
      .then((userPoints) => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        this.setState({ balance });
      })
      .catch((err) => {
        Alert.alert(err.message || err.toString());
      });
  };

  _handleOnSubmit = async () => {
    const { handleOnSubmit, redeemType, navigationParams } = this.props;
    const { permlink, selectedUser, factor } = this.state;
    const fullPermlink = permlink || get(navigationParams, 'permlink');

    const amount = 150 + 50 * factor;

    handleOnSubmit(redeemType, amount, fullPermlink, selectedUser);
  };

  _validateUrl = () => {
    const { permlink, isValid } = this.state;
    if (!isValid) {
      const postUrl = postUrlParser(permlink);
      if (postUrl && postUrl.author && postUrl.permlink) {
        const postPermlink = `${postUrl.author}/${postUrl.permlink}`;
        this.setState({
          permlink: postPermlink,
          isValid: true,
        });
      } else {
        this.setState({ isValid: false });
      }
    }
  };

  render() {
    const { intl } = this.props;
    const { selectedUser, balance, factor, permlinkSuggestions, permlink, isValid } = this.state;

    const {
      isLoading,
      accounts,
      currentAccountName,
      balance: _balance,
      navigationParams,
      SCPath,
      isSCModalOpen,
      handleOnSCModalClose,
      getESTMPrice,
      user,
    } = this.props;

    const calculatedESTM = 150 + 50 * factor;
    // console.log('this.state.permlink : ', this.state.permlink);
    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'boostPost.title' })} />
        <View style={styles.container}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={styles.middleContent}>
              <TransferFormItem
                label={intl.formatMessage({ id: 'promote.user' })}
                rightComponent={() =>
                  this._renderDropdown(accounts, selectedUser || currentAccountName)
                }
              />
              <Text style={styles.balanceText}>{`${balance || _balance} Points`}</Text>
              <View style={styles.autocompleteLineContainer}>
                <View style={styles.autocompleteLabelContainer}>
                  <Text style={styles.autocompleteLabelText}>
                    {intl.formatMessage({ id: 'promote.permlink' })}
                  </Text>
                </View>

                <Autocomplete
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputContainerStyle={styles.autocomplete}
                  data={permlinkSuggestions}
                  listContainerStyle={styles.autocompleteListContainer}
                  listStyle={styles.autocompleteList}
                  onChangeText={this._handleOnPermlinkChange}
                  renderTextInput={() => (
                    <TextInput
                      style={styles.input}
                      onChangeText={(text) => this._handleOnPermlinkChange(text)}
                      value={permlink || get(navigationParams, 'permlink', '')}
                      placeholder={intl.formatMessage({ id: 'promote.permlinkPlaceholder' })}
                      placeholderTextColor="#c1c5c7"
                      autoCapitalize="none"
                      returnKeyType="done"
                      onBlur={() => this._validateUrl()}
                      innerRef={this.urlInputRef}
                    />
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        this.urlInputRef.current?.blur();
                        this.setState({
                          permlink: item,
                          isValid: true,
                          permlinkSuggestions: [],
                        });
                      }}
                    >
                      <Text style={styles.autocompleteItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View style={styles.total}>
                <Text style={styles.price}>
                  {` $${getESTMPrice(calculatedESTM).toFixed(3)} ~ `}
                </Text>
                <Text style={styles.esteem}>{`${calculatedESTM} Points`}</Text>
              </View>

              <View style={styles.quickButtonsWrapper}>
                <MainButton
                  style={styles.quickButtons}
                  isDisable={!(calculatedESTM > 150)}
                  onPress={() =>
                    this.setState({
                      factor: calculatedESTM > 150 ? factor - 1 : factor,
                    })
                  }
                >
                  <Icon
                    size={24}
                    style={{ color: 'white' }}
                    iconType="MaterialCommunityIcons"
                    name="minus"
                  />
                </MainButton>

                <MainButton
                  style={styles.quickButtons}
                  isDisable={!((balance || _balance) / 50 > factor + 4) || !(factor + 4 <= 10)}
                  onPress={() =>
                    this.setState({
                      factor: (balance || _balance) / 50 > factor + 4 ? factor + 1 : factor,
                    })
                  }
                >
                  <Icon size={24} style={{ color: 'white' }} iconType="MaterialIcons" name="add" />
                </MainButton>
              </View>
            </View>

            <View style={styles.bottomContent}>
              <View style={styles.infoWrapper}>
                <Icon
                  size={20}
                  style={styles.infoIcon}
                  iconType="MaterialIcons"
                  name="info-outline"
                />
                <Text style={styles.infoText}>{intl.formatMessage({ id: 'boost.info' })}</Text>
              </View>

              <MainButton
                style={styles.button}
                isDisable={
                  (!permlink ? !get(navigationParams, 'permlink') : permlink) &&
                  (balance || _balance) > 150 &&
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
        <OptionsModal
          ref={this.startActionSheet}
          options={[
            intl.formatMessage({ id: 'alert.confirm' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'promote.information' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={(index) => {
            if (index === 0) {
              if (index === 0) {
                this._handleOnSubmit();
              }
            }
          }}
        />

        <Modal
          isOpen={isSCModalOpen}
          isFullScreen
          isCloseButton
          handleOnModalClose={handleOnSCModalClose}
          title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
        >
          <WebView source={{ uri: `${hsOptions.base_url}${SCPath}` }} />
        </Modal>
      </Fragment>
    );
  }
}

export default injectIntl(BoostPostScreen);
