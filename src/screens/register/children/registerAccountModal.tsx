import { View, Text, Image, Platform, Alert, TextStyle, ActivityIndicator } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet';
import { openInbox } from 'react-native-email-link';
import { signUp } from '@ecency/sdk';
import styles from '../styles/registerAccountModalStyles';
import { InAppPurchaseContainer } from '../../../containers';
import { Icon, MainButton, Modal, PostCardPlaceHolder, TextButton } from '../../../components';
import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';
import ROUTES from '../../../constants/routeNames';
import TurnstileWebView from './turnstileWebView';
import { getUsernameError, USERNAME_ERROR_MESSAGE_IDS } from '../../../utils/usernameValidation';

type Props = {
  username: string;
  email: string;
  refUsername: string;
};

const ITEM_SKUS = Platform.select({
  ios: ['999accounts'],
  android: ['999accounts'],
});

export const RegisterAccountModal = forwardRef(({ username, email, refUsername }: Props, ref) => {
  const intl = useIntl();
  const navigation = useNavigation();

  const _username = useMemo(() => username.toLowerCase(), [username]);

  const [showModal, setShowModal] = useState(false);
  const [disableFree, setDisableFree] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');
  // Bump to remount the Turnstile widget for a fresh (single-use) token after a failure.
  const [captchaKey, setCaptchaKey] = useState(0);

  const _resetCaptcha = () => {
    setCaptchaToken('');
    setCaptchaKey((k) => k + 1);
  };

  useImperativeHandle(ref, () => ({
    showModal: ({ purchaseOnly }: { purchaseOnly: boolean } = { purchaseOnly: false }) => {
      setShowModal(true);
      setIsRegistered(false);
      setIsRegistering(false);
      setDisableFree(purchaseOnly);
      // Start each modal session with a fresh challenge — never reuse a prior token.
      _resetCaptcha();
    },
  }));

  const _onContinuePress = () => {
    navigation.navigate(ROUTES.DRAWER.MAIN);
    openInbox();
  };

  // Last-line guard before either signup path runs. The register screen already
  // blocks a chain-invalid username, but this modal can also be opened directly
  // (e.g. the purchaseOnly deep link), so re-check here so a name the blockchain
  // would reject (the buyer is still charged for the paid path) never reaches the
  // backend.
  const _isUsernameCreatable = () => {
    const errorCode = getUsernameError(_username);
    if (errorCode) {
      Alert.alert(
        intl.formatMessage({ id: 'alert.fail' }),
        intl.formatMessage({ id: USERNAME_ERROR_MESSAGE_IDS[errorCode] }),
      );
      return false;
    }
    return true;
  };

  const _handleOnPressRegister = async () => {
    if (!_isUsernameCreatable()) {
      return;
    }
    setIsRegistering(true);

    try {
      const result = await signUp(_username, email, refUsername, captchaToken);
      if (result?.status >= 200 && result?.status < 300) {
        setIsRegistered(true);
      } else {
        Alert.alert(
          intl.formatMessage({ id: 'alert.fail' }),
          intl.formatMessage({ id: 'alert.unknow_error' }),
        );
        setIsRegistered(false);
        _resetCaptcha();
      }
    } catch (err) {
      const title = intl.formatMessage({ id: 'alert.fail' });
      let body = intl.formatMessage({ id: 'alert.unknow_error' });

      const status = get(err, 'status') || get(err, 'response.status');
      const message = get(err, 'data.message') || get(err, 'response.data.message');

      if (status === 500) {
        body = intl.formatMessage({ id: 'register.500_error' });
      } else if (message) {
        // The backend returns a numeric `code` plus an English `message`. Prefer a
        // localized, code-specific string so non-English users get a translated body,
        // and fall back to the backend message (as defaultMessage) for any locale that
        // hasn't translated the code, or any code we don't map. The backend message is
        // already a complete sentence, so the fallback is always coherent on its own.
        const code = get(err, 'data.code') || get(err, 'response.data.code');
        body = code
          ? intl.formatMessage({ id: `register.error_codes.${code}`, defaultMessage: message })
          : message;
      }
      Alert.alert(title, body);
      _resetCaptcha();
    } finally {
      setIsRegistering(false);
    }
  };

  const _handleOnPurchaseSuccess = () => {
    setIsRegistered(true);
    setIsRegistering(false);
  };

  const _handleOnPurchaseFailure = (error: any) => {
    Alert.alert(
      intl.formatMessage({ id: 'alert.fail' }),
      `${intl.formatMessage({ id: 'register.register_fail' })}\n${error.message}`,
    );
    setIsRegistering(false);
  };

  const _renderIntermediateComponent = () => {
    if (!isRegistering && !isRegistered) {
      return null;
    }

    const _textId = isRegistered ? 'register.registered' : 'register.registering';
    const _indicator = isRegistered ? (
      <Icon
        size={56}
        color={EStyleSheet.value('$primaryGreen')}
        name="check-circle"
        iconType="MaterialIcons"
      />
    ) : (
      <ActivityIndicator size="large" color={EStyleSheet.value('$primaryBlack')} />
    );

    const _action = isRegistered && (
      <MainButton
        onPress={_onContinuePress}
        text={intl.formatMessage({ id: 'alert.continue' })}
        style={styles.actionButton}
      />
    );

    return (
      <View style={styles.registeringContainer}>
        {_indicator}
        <Text style={styles.registeringText}>
          {intl.formatMessage({
            id: _textId,
          })}
        </Text>
        {_action}
      </View>
    );
  };

  const _renderUserInfo = (text: string, style: TextStyle) => (
    <View style={styles.userInfoContainer}>
      <View style={styles.userInfoWrapper}>
        <Text numberOfLines={1} style={style}>
          {text}
        </Text>
      </View>
    </View>
  );

  const _renderCard = ({ titleId, descriptionId, btnTitle, onPress, extra, disabled }: any) => {
    return (
      <View style={styles.cardContainer}>
        <Text style={styles.title}>
          {intl.formatMessage({
            id: titleId,
          })}
        </Text>
        <View style={styles.descContainer}>
          <Text style={styles.description}>
            {intl.formatMessage({
              id: descriptionId,
            })}
          </Text>
        </View>
        {extra}
        <TextButton
          textStyle={styles.buttonText}
          onPress={onPress}
          style={styles.button}
          disabled={disabled !== undefined ? disabled : isRegistering}
          text={btnTitle}
        />
      </View>
    );
  };

  const _renderRegisterOptions = ({ productList, buyItem, unconsumedPurchases }: any) => {
    return isRegistered || isRegistering ? (
      _renderIntermediateComponent()
    ) : (
      <ScrollView style={styles.productsWrapper}>
        {!disableFree &&
          _renderCard({
            titleId: 'free_account.title',
            descriptionId: 'free_account.desc',
            btnTitle: intl.formatMessage({ id: 'free_account.btn_register' }),
            onPress: _handleOnPressRegister,
            extra: (
              <TurnstileWebView
                key={captchaKey}
                onVerify={setCaptchaToken}
                onExpire={() => setCaptchaToken('')}
                onError={_resetCaptcha}
              />
            ),
            disabled: !captchaToken,
          })}

        {productList.map((product: any) =>
          _renderCard({
            titleId: 'buy_account.title',
            descriptionId: 'buy_account.desc',
            btnTitle: unconsumedPurchases.find((p: any) => p.productId === '999accounts')
              ? intl.formatMessage({ id: 'buy_account.claim' })
              : intl.formatMessage(
                  { id: 'buy_account.btn_register' },
                  {
                    // src/providers/iap fills localizedPrice on both platforms;
                    // the Android-only oneTimePurchaseOfferDetails shape does not
                    // exist in the Billing 9 product payload.
                    price: product.localizedPrice,
                  },
                ),
            onPress: () => {
              if (!_isUsernameCreatable()) {
                return;
              }
              setIsRegistering(true);
              buyItem(product.productId);
            },
          }),
        )}
      </ScrollView>
    );
  };

  const _renderContent = () => {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.container}>
              {_renderUserInfo(_username, styles.usernameStyle)}
              {_renderUserInfo(email, styles.emailStyle)}
            </View>
            <Image style={styles.logoEstm} source={LOGO_ESTM} />
          </View>
          <InAppPurchaseContainer
            skus={ITEM_SKUS}
            username={_username}
            email={email}
            referral={refUsername}
            isNoSpin
            disablePurchaseListenerOnMount={true}
            handleOnPurchaseSuccess={_handleOnPurchaseSuccess}
            handleOnPurchaseFailure={_handleOnPurchaseFailure}
          >
            {({ buyItem, productList, isLoading, unconsumedPurchases }: any) => (
              <>
                {isLoading ? (
                  <PostCardPlaceHolder />
                ) : (
                  _renderRegisterOptions({ productList, buyItem, unconsumedPurchases })
                )}
              </>
            )}
          </InAppPurchaseContainer>
        </View>
      </SafeAreaView>
    );
  };

  return (
    <Modal
      isOpen={showModal}
      handleOnModalClose={() => {
        setShowModal(false);
      }}
      isCloseButton
      isFullScreen
      presentationStyle="formSheet"
      title={intl.formatMessage({ id: 'register.modal_title' })}
      animationType="slide"
      style={styles.modalStyle}
    >
      {_renderContent()}
    </Modal>
  );
});
