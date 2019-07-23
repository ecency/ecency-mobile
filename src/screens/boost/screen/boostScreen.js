import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';
import get from 'lodash/get';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { MainButton } from '../../../components/mainButton';
import { Icon } from '../../../components/icon';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './boostScreenStyles';

class BoostScreen extends PureComponent {
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
    const { intl, buyItem, boostData } = this.props;
    const { selectedBoost } = this.state;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'boost.title',
          })}
        />

        {boostData.map(item => (
          <View style={styles.boostLine} key={get(item, 'id')}>
            {!!get(item, 'description', null) && (
              <View style={styles.descriptionWrapper}>
                <Fragment>
                  <Text style={styles.description}>{get(item, 'description')}</Text>
                  <View style={styles.triangle} />
                </Fragment>
              </View>
            )}
            <View style={styles.buttonWrapper}>
              <MainButton
                style={styles.button}
                onPress={() => buyItem(item.id)}
                height={50}
                text={intl.formatMessage({
                  id: 'boost.buy',
                })}
                isDisable={false}
                isLoading={false}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>{get(item, 'name')}</Text>
                  <View style={styles.buttonIconWrapper}>
                    <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                  </View>
                </View>
              </MainButton>
            </View>

            <View style={styles.priceWrapper}>
              <Text style={styles.priceText}>{`$${get(item, 'price', 0).toFixed(2)}`}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }
}

export default injectIntl(BoostScreen);
