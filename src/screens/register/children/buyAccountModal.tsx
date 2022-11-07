import { View, Text, Image, Platform } from 'react-native';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from '../styles/buyAccountModalStyles';
import { InAppPurchaseContainer } from '../../../containers';
import { BoostPlaceHolder, Modal, ProductItemLine } from '../../../components';
import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';

type Props = {
  username: string;
  email: string;
};

const ITEM_SKUS = Platform.select({
  ios: ['999accounts'],
  android: ['999accounts'],
});

export const BuyAccountModal = forwardRef(({ username, email }: Props, ref) => {
  const intl = useIntl();

  const [showModal, setShowModal] = useState(false);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setShowModal(true);
    },
  }));

  const _renderUserInfo = (text: string, style: TextStyle) => (
    <View style={styles.userInfoContainer}>
      <View style={styles.userInfoWrapper}>
        <Text style={style}>{text}</Text>
      </View>
    </View>
  );

  const _renderContent = () => {
    return (
      <InAppPurchaseContainer skus={ITEM_SKUS} username={username} email={email} isNoSpin>
        {({ buyItem, productList, isLoading, isProcessing }) => (
          <SafeAreaView style={styles.container}>
            {isLoading ? (
              <BoostPlaceHolder />
            ) : (
              <View style={styles.contentContainer}>
                <View>
                  {_renderUserInfo(username, styles.usernameStyle)}
                  {_renderUserInfo(email, styles.emailStyle)}
                </View>

                <View style={styles.iconContainer}>
                  <Image style={styles.logoEstm} source={LOGO_ESTM} />
                  <Text style={styles.desc}>
                    {intl.formatMessage({
                      id: 'buy_account.desc',
                    })}
                  </Text>
                </View>

                <View style={styles.productsWrapper}>
                  {productList.map((product) => (
                    <ProductItemLine
                      key={get(product, 'title')}
                      isLoading={isLoading}
                      disabled={isProcessing}
                      product={product}
                      title={intl.formatMessage({ id: 'buy_account.btn_buy' })}
                      handleOnButtonPress={(id) => buyItem(id)}
                    />
                  ))}
                </View>
              </View>
            )}
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
      title={intl.formatMessage({ id: 'buy_account.title' })}
      animationType="slide"
      style={styles.modalStyle}
    >
      {_renderContent()}
    </Modal>
  );
});
