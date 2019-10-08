import React from 'react';
import { View, Platform } from 'react-native';
import get from 'lodash/get';
import { useIntl } from 'react-intl';

// Components
import { BasicHeader, BoostPlaceHolder, ProductItemLine } from '../../../components';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import globalStyles from '../../../globalStyles';

const ITEM_SKUS = Platform.select({
  ios: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
  android: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
});

const _getTitle = title => {
  let _title = title.toUpperCase();

  if (_title.includes('(ESTEEM)')) {
    _title = _title.replace('(ESTEEM)', '');
  }

  return _title;
};

const BoostScreen = () => {
  const intl = useIntl();

  return (
    <InAppPurchaseContainer skus={ITEM_SKUS}>
      {({ buyItem, productList, isLoading, isProcessing }) => (
        <View style={globalStyles.container}>
          <BasicHeader
            disabled={isProcessing}
            title={intl.formatMessage({
              id: 'boost.title',
            })}
          />

          {isLoading ? (
            <BoostPlaceHolder />
          ) : (
            productList.map(product => (
              <ProductItemLine
                isLoading={isLoading}
                disabled={isProcessing}
                product={product}
                title={_getTitle(get(product, 'title'))}
                handleOnButtonPress={id => buyItem(id)}
              />
            ))
          )}
        </View>
      )}
    </InAppPurchaseContainer>
  );
};

export default BoostScreen;
