import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';
import get from 'lodash/get';

// Components
import { BasicHeader, Icon, MainButton, BoostPlaceHolder } from '../../../components';

// Container
import { InAppPurchaseContainer } from '../../../containers';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './boostScreenStyles';

const DEALS = { '9999points': 'BEST DEAL!', '4999points': 'POPULAR!' };

class BoostScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  _renderDeal = item => {
    if (DEALS[item.productId]) {
      return (
        <View style={styles.descriptionWrapper}>
          <Fragment>
            <Text style={styles.description}>{DEALS[item.productId]}</Text>
            <View style={styles.triangle} />
          </Fragment>
        </View>
      );
    }

    return null;
  };

  _getTitle = title => {
    let _title = title.toUpperCase();

    if (_title.includes('(ESTEEM)')) {
      _title = _title.replace('(ESTEEM)', '');
    }

    return _title;
  };

  render() {
    const { intl } = this.props;

    return (
      <InAppPurchaseContainer>
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
              productList.map(item => (
                <View style={styles.boostLine} key={get(item, 'productId')}>
                  {this._renderDeal(item)}
                  <View style={styles.buttonWrapper}>
                    <MainButton
                      style={styles.button}
                      onPress={() => buyItem(item.productId)}
                      height={50}
                      text={intl.formatMessage({
                        id: 'boost.buy',
                      })}
                      isDisable={isProcessing}
                      isLoading={false}
                    >
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>{this._getTitle(get(item, 'title'))}</Text>
                        <View style={styles.buttonIconWrapper}>
                          <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                        </View>
                      </View>
                    </MainButton>
                  </View>

                  <View style={styles.priceWrapper}>
                    {get(item, 'localizedPrice', null) && (
                      <Text style={styles.priceText}>{get(item, 'localizedPrice', 0)}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </InAppPurchaseContainer>
    );
  }
}

export default injectIntl(BoostScreen);
