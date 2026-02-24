import React, { Fragment, useState, useEffect, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import get from 'lodash/get';
import Autocomplete from '@esteemapp/react-native-autocomplete-input';
import { useQueryClient } from '@tanstack/react-query';
import { getSearchPathQueryOptions } from '@ecency/sdk';
import { ScaleSlider, TextInput } from '..';
import { hsOptions } from '../../constants/hsOptions';

// Services and Actions

// Components
import { BasicHeader } from '../basicHeader';
import { TransferFormItem } from '../transferFormItem';
import { MainButton } from '../mainButton';
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
  currentAccountName,
  balance: _balance,
  SCPath,
  isSCModalOpen,
  handleOnSCModalClose,
}) => {
  const [permlink, setPermlink] = useState('');
  const [day, setDay] = useState(1);
  const [permlinkSuggestions, setPermlinkSuggestions] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const balance = _balance ?? 0;
  const effectivePermlink = permlink || get(navigationParams, 'permlink', '');

  const startActionSheet = useRef(null);
  const timerRef = useRef<number | null>(null);
  const lastQueryKeyRef = useRef<unknown[] | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const pr = get(PROMOTE_PRICING[PROMOTE_DAYS.indexOf(day)], 'price');
    if (pr > balance) {
      setIsValid(false);
    }
    if (effectivePermlink && pr <= balance) {
      setIsValid(true);
    }
  }, [day, effectivePermlink, balance]);

  // Component Functions

  const _handleOnPermlinkChange = async (text) => {
    setPermlink(text);
    setIsValid(false);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (lastQueryKeyRef.current) {
      queryClient.cancelQueries({ queryKey: lastQueryKeyRef.current }, { silent: true });
      lastQueryKeyRef.current = null;
    }

    if (text.trim().length < 3) {
      setPermlinkSuggestions([]);
      return;
    }

    if (text && text.length > 0) {
      const nextQueryKey = getSearchPathQueryOptions(text).queryKey;
      lastQueryKeyRef.current = nextQueryKey;
      timerRef.current = setTimeout(
        () =>
          queryClient
            .fetchQuery(getSearchPathQueryOptions(text))
            .then((res) => {
              setPermlinkSuggestions(res && res.length > 10 ? res.slice(0, 7) : res);
            })
            .catch((err) => {
              console.error('Failed to fetch search path', err);
              setPermlinkSuggestions([]);
            })
            .finally(() => {
              timerRef.current = null;
            }),
        500,
      );
    } else {
      setPermlinkSuggestions([]);
      setIsValid(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  const _renderDropdown = (accountName) => <Text style={styles.dropdownText}>{accountName}</Text>;

  const _handleOnSubmit = async () => {
    const fullPermlink = effectivePermlink;
    if (!currentAccountName) {
      return;
    }

    handleOnSubmit(redeemType, day, fullPermlink, currentAccountName);
  };

  return (
    <Fragment>
      <BasicHeader title={intl.formatMessage({ id: 'promote.title' })} />
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.middleContent}>
            <TransferFormItem
              label={intl.formatMessage({ id: 'promote.user' })}
              rightComponent={() => _renderDropdown(currentAccountName)}
            />
            <Text style={styles.balanceText}>{`${balance} Points`}</Text>
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
                      value={effectivePermlink}
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
              isDisable={!effectivePermlink || isLoading || !isValid || !currentAccountName}
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
