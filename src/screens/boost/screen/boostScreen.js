import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { MainButton } from '../../../components/mainButton';
import { Icon } from '../../../components/icon';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './boostScreenStyles';

const BOOST_DATA = [
  {
    name: '10000 ESTM',
    priceText: '100$',
    price: 100,
    description: 'BEST DEAL!',
  },
  { name: '5000 ESTM', priceText: '50.00$', price: 50, description: 'POPULAR' },
  { name: '1000 ESTM', priceText: '10.00$', price: 10, description: '' },
  { name: '500 ESTM', priceText: '5.00$', price: 5, description: '' },
  { name: '200 ESTM', priceText: '2.00$', price: 2, description: '' },
  { name: '100 ESTM', priceText: '1.00$', price: 1, description: '' },
];

class BoostScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      selectedBoost: 0,
    };
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const { intl } = this.props;
    const { selectedBoost } = this.state;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'boost.title',
          })}
        />

        {BOOST_DATA.map(item => (
          <View style={styles.boostLine}>
            {item.description && (
              <View style={styles.descriptionWrapper}>
                <Text>{item.description}</Text>
              </View>
            )}

            <MainButton
              style={styles.button}
              onPress={() => alert(selectedBoost)}
              height={50}
              text={intl.formatMessage({
                id: 'boost.buy',
              })}
              isDisable={false}
              isLoading={false}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>{item.name}</Text>
                <View style={styles.buttonIconWrapper}>
                  <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                </View>
              </View>
            </MainButton>

            <View style={styles.priceWrapper}>
              <Text>{item.priceText}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

export default injectIntl(BoostScreen);
