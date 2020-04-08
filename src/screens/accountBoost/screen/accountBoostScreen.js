import React from 'react';
import { View, Platform, ScrollView, Image, Text } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { BasicHeader, BoostPlaceHolder, ProductItemLine } from '../../../components';

import LOGO_ESTM from '../../../assets/esteemcoin_boost.png';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './accountBoostStyles';

const ITEM_SKUS = Platform.select({
  ios: ['999boost'],
  android: ['999boost'],
});

const AccountBoost = () => {
  const intl = useIntl();

  return (
    <InAppPurchaseContainer skus={ITEM_SKUS} isNoSpin>
      {({ buyItem, productList, isLoading, isProcessing }) => (
        <View style={globalStyles.container}>
          <BasicHeader
            disabled={isProcessing}
            title={intl.formatMessage({
              id: 'boost.account.title',
            })}
          />
          <>
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
