import React, { useMemo } from 'react';
import { View, Platform, SafeAreaView, Image, Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { useSelector } from 'react-redux';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader, BoostPlaceHolder, ProductItemLine } from '../../../components';

import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import styles from './accountBoostStyles';
import UserRibbon from '../../../components/userRibbon/userRibbon';
import { vestsToHp } from '../../../utils/conversions';

const ITEM_SKUS = Platform.select({
  ios: ['999boosts'],
  android: ['999boosts'],
});

const ACCOUNT_BOOST_VESTS = 553311;

const AccountBoost = ({ route }) => {
  const intl = useIntl();
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const globalProps = useSelector((state) => state.account.globalProps);

  const { username } = route.params ?? {};

  const delegateAmount = useMemo(
    () => vestsToHp(ACCOUNT_BOOST_VESTS, globalProps.hivePerMVests).toFixed(1),
    [],
  );

  return (
    <InAppPurchaseContainer route={route} skus={ITEM_SKUS} username={username} isNoSpin>
      {({ buyItem, productList, isLoading, isProcessing }) => (
        <SafeAreaView style={styles.container}>
          <BasicHeader
            disabled={isProcessing}
            title={intl.formatMessage({
              id: 'boost.account.title',
            })}
          />

          {isLoading ? (
            <BoostPlaceHolder />
          ) : (
            <View style={styles.contentContainer}>
              <UserRibbon username={username || currentAccount.name} />
              <View style={styles.iconContainer}>
                <Image style={styles.logoEstm} source={LOGO_ESTM} />
                <Text style={styles.desc}>
                  {intl.formatMessage({
                    id: 'boost.account.desc',
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
                    title={`Boost+  |  ${delegateAmount} HP`}
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

export default gestureHandlerRootHOC(AccountBoost);
