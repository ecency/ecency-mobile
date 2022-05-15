import React, { PureComponent, Fragment, useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import Autocomplete from '@esteemapp/react-native-autocomplete-input';
import { ScaleSlider, TextInput } from '..';
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

import { PROMOTE_PRICING, PROMOTE_DAYS } from '../../constants/options/points';

// Styles
import styles from './promoteStyles';
import { OptionsModal } from '../atoms';

const PromoteView = ({
  intl,
  handleOnSubmit,
  redeemType,
  navigationParams,
  isLoading,
  accounts,
  currentAccountName,
  balance: _balance,
  SCPath,
  isSCModalOpen,
  handleOnSCModalClose,
}) => {
  const [permlink, setPermlink] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [balance, setBalance] = useState('');
  const [day, setDay] = useState(1);
  const [permlinkSuggestions, setPermlinkSuggestions] = useState([]);
  const [isValid, setIsValid] = useState(false);

  const startActionSheet = useRef(null);
  let timer = null;

  useEffect(() => {
    const pr = get(PROMOTE_PRICING[PROMOTE_DAYS.indexOf(day)], 'price');
    if (pr > _balance || pr > balance) {
      setIsValid(false);
    }
    if (permlink && (pr <= _balance || pr <= _balance)) {
      setIsValid(true);
    }
  }, [day, balance, permlink]);

  useEffect(() => {
    if (selectedUser) {
      _getUserBalance(selectedUser);
    }
  }, [selectedUser]);

  // Component Functions

  const _handleOnPermlinkChange = async (text) => {
    setPermlink(text);
    setIsValid(false);

    if (timer) {
      clearTimeout(timer);
    }

    if (text.trim().length < 3) {
      setPermlinkSuggestions([]);
      return;
    }

    if (text && text.length > 0) {
      timer = setTimeout(
        () =>
          searchPath(text).then((res) => {
            setPermlinkSuggestions(res && res.length > 10 ? res.slice(0, 7) : res);
          }),
        500,
      );
    } else {
      setPermlinkSuggestions([]);
      setIsValid(false);
    }
  };

  const _renderDescription = (text) => <Text style={styles.description}>{text}</Text>;

  const _renderDropdown = (accounts, currentAccountName) => (
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
        setSelectedUser(value);
      }}
    />
  );

  const _getUserBalance = async (username) => {
    await getPointsSummary(username)
      .then((userPoints) => {
        const balance = Math.round(get(userPoints, 'points') * 1000) / 1000;
        setBalance(balance);
      })
      .catch((err) => {
        Alert.alert(err.message || err.toString());
      });
  };

  const _handleOnSubmit = async () => {
    const fullPermlink = permlink || get(navigationParams, 'permlink');

    handleOnSubmit(redeemType, day, fullPermlink, selectedUser);
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'promote.title' })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'promote.user' })}
              rightComponent={() => _renderDropdown(accounts, selectedUser || currentAccountName)}
            />
            <Text style={styles.balanceText}>{`${balance || _balance} Points`}</Text>
            <Fragment>
              <View style={styles.autocomplateLineContainer}>
                <View style={styles.autocomplateLabelContainer}>
                  <Text style={styles.autocomplateLabelText}>
                    {intl.formatMessage({ id: 'promote.permlink' })}
                  </Text>
                </View>

                <Autocomplete
                  autoCapitalize="none"
                  autoCorrect={false}
                  inputContainerStyle={styles.autocomplate}
                  data={permlinkSuggestions}
                  listContainerStyle={styles.autocomplateListContainer}
                  listStyle={styles.autocomplateList}
                  onChangeText={(text) => _handleOnPermlinkChange(text)}
                  renderTextInput={() => (
                    <TextInput
                      style={styles.input}
                      onChangeText={(text) => _handleOnPermlinkChange(text)}
                      value={permlink || get(navigationParams, 'permlink', '')}
                      placeholder={intl.formatMessage({ id: 'promote.permlinkPlaceholder' })}
                      placeholderTextColor="#c1c5c7"
                      autoCapitalize="none"
                    />
                  )}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      key={item}
                      onPress={() => {
                        setPermlink(item);
                        setIsValid(true);
                        setPermlinkSuggestions([]);
                      }}
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
                {`${get(PROMOTE_PRICING[PROMOTE_DAYS.indexOf(day)], 'price')} Points  `}
              </Text>
            </View>

            <ScaleSlider
              values={[1, 2, 3, 7, 14]}
              LRpadding={50}
              activeValue={day}
              handleOnValueChange={(_day) => setDay(_day)}
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
              onPress={() => startActionSheet.current.show()}
              isLoading={isLoading}
            >
              <Text style={styles.buttonText}>{intl.formatMessage({ id: 'transfer.next' })}</Text>
            </MainButton>
          </View>
        </ScrollView>
      </View>
      <OptionsModal
        ref={startActionSheet}
        options={[
          intl.formatMessage({ id: 'alert.confirm' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'promote.information' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            _handleOnSubmit();
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
};

export default injectIntl(PromoteView);
