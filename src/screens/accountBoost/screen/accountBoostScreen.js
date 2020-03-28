import React from 'react';
import { View, Platform, ScrollView } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { BasicHeader, BoostPlaceHolder, ProductItemLine } from '../../../components';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import globalStyles from '../../../globalStyles';

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

          {isLoading ? (
            <BoostPlaceHolder />
          ) : (
            <ScrollView>
              {productList.map((product) => (
                <ProductItemLine
                  key={get(product, 'title')}
                  isLoading={isLoading}
                  disabled={isProcessing}
                  product={product}
                  title={get(product, 'title', '').toUpperCase()}
                  handleOnButtonPress={(id) => buyItem(id)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </InAppPurchaseContainer>
  );
};

export default AccountBoost;
