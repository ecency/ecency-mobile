import { View, Text, Image, Platform, Alert, TextStyle, ActivityIndicator } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../styles/registerAccountModalStyles';
import { InAppPurchaseContainer } from '../../../containers';
import { BoostPlaceHolder, Modal, ProductItemLine } from '../../../components';
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

  const [showModal, setShowModal] = useState(false);
  const [disableFree, setDisableFree] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal: ({ purchaseOnly }: { purchaseOnly: boolean } = { purchaseOnly: false }) => {
      setShowModal(true);
      setDisableFree(purchaseOnly);
    },
  }));

  const _handleOnRegisterSuccess = () => {
    navigation.navigate(ROUTES.DRAWER.MAIN);
    Alert.alert('Success', 'Hurrah, you did it! Expect email from us with further instructions.');
  };

  const _handleOnPressRegister = () => {
    setIsRegistering(true);

    signUp(username, email, refUsername)
      .then((result) => {
        if (result) {
          _handleOnRegisterSuccess();
        }
        setIsRegistering(false);
      })
      .catch((err) => {
        if (get(err, 'response.status') === 500) {
          Alert.alert(
            intl.formatMessage({ id: 'alert.fail' }),
            intl.formatMessage({ id: 'register.500_error' }),
          );
        } else if (get(err, 'response.data.message')) {
          Alert.alert(
            intl.formatMessage({ id: 'alert.fail' }),
            `${err.response.data.message}\nTry buying account instead`,
            [
              {
                text: 'Okay',
              },
              {
                text: 'Cancel',
              },
            ],
          );
        } else {
          Alert.alert(
            intl.formatMessage({ id: 'alert.fail' }),
            intl.formatMessage({ id: 'alert.unknow_error' }),
          );
        }
        setIsRegistering(false);
      });
  };

  const _handleOnPurchaseSuccess = () => {
    _handleOnRegisterSuccess();
    setIsRegistering(false);
  };

  const _handleOnPurchaseFailure = () => {
    setIsRegistering(false);
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
        <TouchableOpacity onPress={onPress} style={styles.button} disabled={isRegistering}>
          <Text style={styles.buttonText}>{btnTitle}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const _renderRegisterOptions = ({ productList, buyItem }) => {
    return (
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <View>
            {_renderUserInfo(username, styles.usernameStyle)}
            {_renderUserInfo(email + email, styles.emailStyle)}
          </View>
          <Image style={styles.logoEstm} source={LOGO_ESTM} />
        </View>

        {isRegistering ? (
          <View style={styles.registeringContainer}>
            <ActivityIndicator size="large" color={EStyleSheet.value('$primaryBlue')} />
            <Text style={styles.registeringText}>
              {intl.formatMessage({
                id: 'register.registering',
              })}
            </Text>
          </View>
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
                
                btnTitle: intl.formatMessage(
                  { id: 'buy_account.btn_register' },
                  { price: product.localizedPrice },
                ),
                onPress: () => {
                  setIsRegistering(true);
                  buyItem(product.productId);
                },
              }),
            )}
          </ScrollView>
        )}
      </View>
    );
  };

  const _renderContent = () => {
    return (
      <InAppPurchaseContainer
        skus={ITEM_SKUS}
        username={username}
        email={email}
        isNoSpin
        handleOnPurchaseSuccess={_handleOnPurchaseSuccess}
        handleOnPurchaseFailure={_handleOnPurchaseFailure}
      >
        {({ buyItem, productList, isLoading }) => (
          <SafeAreaView style={styles.container}>
            {isLoading ? <BoostPlaceHolder /> : _renderRegisterOptions({ productList, buyItem })}
          </SafeAreaView>
        )}
      </InAppPurchaseContainer>
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
