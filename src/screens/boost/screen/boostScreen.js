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
import UserRibbon from '../../../components/userRibbon/userRibbon';
import styles from './styles';

const ITEM_SKUS = Platform.select({
  ios: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
  android: ['099points', '199points', '499points', '999points', '4999points', '9999points'],
});

const _getTitle = (title) => {
  let _title = title.toUpperCase();
  if (_title !== 'FREE POINTS') {
    _title = _title.replace(/[^0-9]+/g, '') + ' POINTS';
  }

  return _title;
};

const BoostScreen = ({ navigation }) => {
  const intl = useIntl();
  const productId = navigation.getParam('productId', '');
  const username = navigation.getParam('username', '');

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
          {username ? (
            <UserRibbon username={username} containerStyle={styles.userRibbonContainer} />
          ) : null}
          {isLoading ? (
            <BoostPlaceHolder />
          ) : (
            <ScrollView contentContainerStyle={styles.listContainer}>
              {productList.map((product) => (
                <ProductItemLine
                  key={get(product, 'title')}
                  isLoading={isLoading}
                  disabled={isProcessing}
                  product={product}
                  title={_getTitle(get(product, 'title'))}
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

export default BoostScreen;
