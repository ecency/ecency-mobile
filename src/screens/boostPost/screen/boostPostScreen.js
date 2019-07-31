import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, WebView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';
import Autocomplete from 'react-native-autocomplete-input';
import { Icon, TextInput } from '../../../components';
import { steemConnectOptions } from '../../../constants/steemConnectOptions';

// Container
import { PointsContainer } from '../../../containers';

// Services and Actions
import { getUser } from '../../../providers/esteem/ePoint';
import { searchPath } from '../../../providers/esteem/esteem';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { TransferFormItem } from '../../../components/transferFormItem';
import { MainButton } from '../../../components/mainButton';
import { DropdownButton } from '../../../components/dropdownButton';
import { Modal } from '../../../components/modal';

// import { PROMOTE_PRICING, PROMOTE_DAYS } from '../../../constants/options/points';

// Styles
import styles from './boostPostStyles';

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
      isSCModalOpen: false,
      SCPath: '',
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
        Alert.alert(err);
      });
  };

  _boost = async (boost, currentAccount, getUserDataWithUsername, navigationParams) => {
    const { factor, permlink, selectedUser } = this.state;
    const fullPermlink = permlink || get(navigationParams, 'permlink');

    const seperatedPermlink = fullPermlink.split('/');
    const _author = get(seperatedPermlink, '[0]');
    const _permlink = get(seperatedPermlink, '[1]');
    const amount = 150 + 50 * factor;

    if (get(currentAccount, 'local.authType') === 'steemConnect') {
      const json = JSON.stringify({
        user: selectedUser,
        _author,
        _permlink,
        amount,
      });

      const uri = `sign/custom-json?authority=active&required_auths=%5B%22${selectedUser}%22%5D&required_posting_auths=%5B%5D&id=esteem_boost&json=${encodeURIComponent(
        json,
      )}`;

      this.setState({
        isSCModalOpen: true,
        SCPath: uri,
      });
    } else if (boost) {
      let userFromRealm;

      if (selectedUser) {
        userFromRealm = await getUserDataWithUsername(selectedUser);
      }

      const user = userFromRealm
        ? {
            name: selectedUser,
            local: userFromRealm[0],
          }
        : currentAccount;

      if (amount && _permlink) boost(amount, _permlink, _author, user);
    }
  };

  render() {
    const { intl } = this.props;
    const {
      selectedUser,
      balance,
      factor,
      SCPath,
      isSCModalOpen,
      permlinkSuggestions,
      permlink,
      isValid,
    } = this.state;

    const calculatedESTM = 150 + 50 * factor;

    return (
      <PointsContainer>
        {({
          isLoading,
          accounts,
          currentAccountName,
          balance: _balance,
          currentAccount,
          getUserDataWithUsername,
          navigationParams,
          getESTMPrice,
          boost,
        }) => (
          <Fragment>
            <BasicHeader title={intl.formatMessage({ id: 'boostPost.title' })} />
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
                      onChangeText={this._handleOnPermlinkChange}
                      renderTextInput={() => (
                        <TextInput
                          style={styles.input}
                          onChangeText={text => this._handleOnPermlinkChange(text)}
                          value={permlink || get(navigationParams, 'permlink', '')}
                          placeholder={intl.formatMessage({ id: 'promote.permlinkPlaceholder' })}
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

                  <View style={styles.total}>
                    <Text style={styles.price}>
                      {`${getESTMPrice(calculatedESTM).toFixed(3)} $ `}
                    </Text>
                    <Text style={styles.esteem}>{`${calculatedESTM} ESTM`}</Text>
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
                      isDisable={!(_balance / 50 > factor + 4)}
                      onPress={() =>
                        this.setState({
                          factor: _balance / 50 > factor + 4 ? factor + 1 : factor,
                        })
                      }
                    >
                      <Icon
                        size={24}
                        style={{ color: 'white' }}
                        iconType="MaterialIcons"
                        name="add"
                      />
                    </MainButton>
                  </View>
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
                    <Text style={styles.buttonText}>
                      {intl.formatMessage({ id: 'transfer.next' })}
                    </Text>
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
                index === 0 &&
                  this._boost(boost, currentAccount, getUserDataWithUsername, navigationParams);
              }}
            />

            <Modal
              isOpen={isSCModalOpen}
              isFullScreen
              isCloseButton
              handleOnModalClose={() => this.setState({ isSCModalOpen: false })}
              title={intl.formatMessage({ id: 'transfer.steemconnect_title' })}
            >
              <WebView source={{ uri: `${steemConnectOptions.base_url}${SCPath}` }} />
            </Modal>
          </Fragment>
        )}
      </PointsContainer>
    );
  }
}

export default injectIntl(BoostPostScreen);
