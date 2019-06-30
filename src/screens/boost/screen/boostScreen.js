import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text, ImageBackground } from 'react-native';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { BoostItemsList } from '../../../components/boostItemsList';
import { MainButton } from '../../../components/mainButton';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './boostScreenStyles';

const SIDE_MENU_BACKGROUND = require('../../../assets/side_menu_background.png');

const BOOST_DATA = [
  { name: '100 ESTM', color: '#fff', price: '1$', description: 'For beginner users' },
  { name: '200 ESTM', color: '#fff', price: '2$', description: 'awesome point' },
  { name: '500 ESTM', color: '#fff', price: '5$', description: 'awesome point' },
  { name: '1000 ESTM', color: '#fff', price: '10$', description: 'awesome point' },
  { name: '5000 ESTM', color: '#fff', price: '50$', description: 'Most using' },
  { name: '10000 ESTM', color: '#fff', price: '100$', description: 'Popular choice' },
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
        <ImageBackground source={SIDE_MENU_BACKGROUND} style={styles.descriptionWrapper}>
          <Text style={styles.title}>{BOOST_DATA[selectedBoost].name}</Text>
          <Text style={styles.description}>{BOOST_DATA[selectedBoost].description}</Text>
        </ImageBackground>

        <View style={styles.wrapper}>
          <BoostItemsList
            items={BOOST_DATA}
            handleOnPlaceSelect={item => console.log(item)}
            selectedSlide={2}
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
