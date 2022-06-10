import React from 'react';
import { View, Platform, ScrollView, Image, Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { useSelector } from 'react-redux';
import { BasicHeader, BoostPlaceHolder, ProductItemLine, UserAvatar } from '../../../components';

import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './accountBoostStyles';

const ITEM_SKUS = Platform.select({
  ios: ['999boosts'],
  android: ['999boosts'],
});

const AccountBoost = ({ navigation }) => {
  const intl = useIntl();
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const { username } = navigation.state.params;

  return (
    <InAppPurchaseContainer skus={ITEM_SKUS} username={username} isNoSpin>
      {({ buyItem, productList, isLoading, isProcessing }) => (
        <View style={globalStyles.container}>
          <BasicHeader
            disabled={isProcessing}
            title={intl.formatMessage({
              id: 'boost.account.title',
            })}
          />
          <>
            <View style={styles.userContainer}>
              <UserAvatar
                username={username ? username : currentAccount.name}
                style={styles.avatarStyle}
                disableSize
              />
              <Text style={styles.usernameText}>{username ? username : currentAccount.name}</Text>
            </View>
            <View style={styles.container}>
              <Image style={styles.logoEstm} source={LOGO_ESTM} />
              <Text style={styles.desc}>
                {intl.formatMessage({
                  id: 'boost.account.desc',
                })}
              </Text>
            </View>
            {isLoading ? (
              <BoostPlaceHolder />
            ) : (
              <ScrollView>
                <View style={styles.productsWrapper}>
                  {productList.map((product) => (
                    <ProductItemLine
                      key={get(product, 'title')}
                      isLoading={isLoading}
                      disabled={isProcessing}
                      product={product}
                      title="Boost+"
                      handleOnButtonPress={(id) => buyItem(id)}
                    />
                  ))}
                </View>
              </ScrollView>
            )}
          </>
        </View>
      )}
    </InAppPurchaseContainer>
  );
};

export default AccountBoost;
