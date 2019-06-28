import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { BoostItemsList } from '../../../components/boostItemsList';
import { MainButton } from '../../../components/mainButton';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './boostScreenStyles';

const BOOST_DATA = [
  { name: '100 ESTM', color: '#fff', price: '1$', description: 'awesome point' },
  { name: '200 ESTM', color: '#fff', price: '2$', description: 'awesome point' },
  { name: '500 ESTM', color: '#fff', price: '5$', description: 'awesome point' },
  { name: '1000 ESTM', color: '#fff', price: '10$', description: 'awesome point' },
  { name: '5000 ESTM', color: '#fff', price: '50$', description: 'awesome point' },
  { name: '10000 ESTM', color: '#fff', price: '100$', description: 'awesome point' },
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
        <View style={styles.descriptionWrapper}>
          <Text style={styles.title}>{BOOST_DATA[selectedBoost].name}</Text>
        </View>

        <View style={styles.wrapper}>
          <BoostItemsList
            items={BOOST_DATA}
            handleOnPlaceSelect={item => console.log(item)}
            selectedSlide={0}
            onSnapToItem={item => this.setState({ selectedBoost: item })}
          />
        </View>
        <View style={styles.button}>
          <MainButton
            onPress={() => alert('aa')}
            iconName="rocket"
            iconType="MaterialCommunityIcons"
            iconColor="white"
            text={intl.formatMessage({
              id: 'boost.buy',
            })}
            isDisable={false}
            isLoading={false}
          />
        </View>
      </View>
    );
  }
}

export default injectIntl(BoostScreen);
