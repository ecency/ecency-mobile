import React from 'react';
import { View, Text } from 'react-native';
import get from 'lodash/get';

// Components
import { MainButton, Icon } from '..';

import styles from './productItemLineStyles';

// TODO: move to translation
const DEALS = { '9999points': 'BEST DEAL!', '4999points': 'POPULAR!' };

const ProductItemLineView = ({ disabled, handleOnButtonPress, product, title }) => {
  return (
    <View style={styles.boostLine} key={get(product, 'productId').toString()}>
      {_renderDeal(product)}
      <View style={styles.buttonWrapper}>
        <MainButton
          style={styles.button}
          onPress={() => handleOnButtonPress(get(product, 'productId'))}
          height={50}
          isDisable={disabled}
          isLoading={false}
        >
          <View style={styles.buttonContent}>
            <Text style={styles.buttonText}>{title}</Text>
            <View style={styles.buttonIconWrapper}>
              <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
            </View>
          </View>
        </MainButton>
      </View>

      <View style={styles.priceWrapper}>
        {get(product, 'localizedPrice', null) && (
          <Text style={styles.priceText}>{get(product, 'localizedPrice', 0)}</Text>
        )}
      </View>
    </View>
  );
};

const _renderDeal = (item) => {
  if (DEALS[item.productId]) {
    return (
      <View style={styles.descriptionWrapper}>
        <Text style={styles.description}>{DEALS[item.productId]}</Text>
        <View style={styles.triangle} />
      </View>
    );
  }

  return null;
};

export { ProductItemLineView as ProductItemLine };
