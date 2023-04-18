import { View, Text, Image, Platform, Alert, TextStyle, ActivityIndicator } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet';
import { openInbox } from 'react-native-email-link';
import Reactotron from 'reactotron-react-native';
import styles from '../styles/registerAccountModalStyles';
import { InAppPurchaseContainer } from '../../../containers';
import { Icon, MainButton, Modal, PostCardPlaceHolder, TextButton } from '../../../components';
import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';
import { signUp } from '../../../providers/ecency/ecency';
import ROUTES from '../../../constants/routeNames';

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

  useImperativeHandle(ref, () => ({
    showModal: ({ purchaseOnly }: { purchaseOnly: boolean } = { purchaseOnly: false }) => {
      setShowModal(true);
      setIsRegistered(false);
      setIsRegistering(false);
      setDisableFree(purchaseOnly);
    },
  }));

  const _onContinuePress = () => {
    navigation.navigate(ROUTES.DRAWER.MAIN);
    openInbox();
  };

  const _handleOnPressRegister = () => {
    setIsRegistering(true);

    signUp(_username, email, refUsername)
      .then((result) => {
        if (result) {
          setIsRegistered(true);
        }
        setIsRegistering(false);
      })
      .catch((err) => {
        Reactotron.log(err);
        let title = intl.formatMessage({ id: 'alert.fail' });
        let body = intl.formatMessage({ id: 'alert.unknow_error' });

        if (get(err, 'response.status') === 500) {
          title = intl.formatMessage({ id: 'alert.fail' });
          body = intl.formatMessage({ id: 'register.500_error' });
        } else if (get(err, 'response.data.message')) {
          title = intl.formatMessage({ id: 'alert.fail' });
          body = intl.formatMessage(
            { id: 'register.error_message' },
            { message: err.response.data.message },
          );
        }
        Alert.alert(title, body);
        setIsRegistering(false);
      });
  };

  const _handleOnPurchaseSuccess = () => {
    setIsRegistered(true);
    setIsRegistering(false);
  };

  const _handleOnPurchaseFailure = (error) => {
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

  const _renderCard = ({ titleId, descriptionId, btnTitle, onPress }) => {
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
        <TextButton
          textStyle={styles.buttonText}
          onPress={onPress}
          style={styles.button}
          disabled={isRegistering}
          text={btnTitle}
        />
      </View>
    );
  };

  const _renderRegisterOptions = ({ productList, buyItem, unconsumedPurchases }) => {
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
          })}

        {productList.map((product) =>
          _renderCard({
            titleId: 'buy_account.title',
            descriptionId: 'buy_account.desc',
            btnTitle: unconsumedPurchases.find((p) => p.productId === '999accounts')
              ? intl.formatMessage({ id: 'buy_account.claim' })
              : intl.formatMessage(
                  { id: 'buy_account.btn_register' },
                  {
                    price: Platform.select({
                      ios: product.localizedPrice,
                      android: product.oneTimePurchaseOfferDetails?.formattedPrice,
                    }),
                  },
                ),
            onPress: () => {
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
            isNoSpin
            disablePurchaseListenerOnMount={true}
            handleOnPurchaseSuccess={_handleOnPurchaseSuccess}
            handleOnPurchaseFailure={_handleOnPurchaseFailure}
          >
            {({ buyItem, productList, isLoading, unconsumedPurchases }) => (
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
