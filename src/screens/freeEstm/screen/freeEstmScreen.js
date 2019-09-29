import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Image, ImageBackground, Text, View } from 'react-native';

// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { BoostIndicatorAnimation, MainButton } from '../../../components';

import ESTM_TAGS from '../../../assets/estmTags.png';

// Styles
import styles from './freeEstmStyles';

class FreeEstmScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isSpinning: false,
      spinRight: 1,
    };
  }

  _handleOnSpinPress = () => {
    const { spinRight } = this.state;

    this.setState({
      isSpinning: true,
      spinRight: spinRight - 1,
    });
  };

  render() {
    const { intl } = this.props;
    const { isSpinning, spinRight } = this.state;

    return (
      <PointsContainer>
        {({ isLoading, balance: _balance }) => (
          <Fragment>
            <BasicHeader title={intl.formatMessage({ id: 'free_estm.title' })} />
            <View style={styles.container}>
              <View style={styles.textWrapper}>
                {!isSpinning && (
                  <Fragment>
                    <Text style={styles.count}>{spinRight}</Text>
                    <Text style={styles.countDesc}>Spin Left</Text>
                  </Fragment>
                )}
              </View>
              <View style={styles.spinnerWrapper}>
                {!isSpinning && <Image source={ESTM_TAGS} style={styles.backgroundTags} />}
                <BoostIndicatorAnimation isSpinning={isSpinning} />

                <View style={{ flex: 1 }}>
                  {!isSpinning && (
                    <MainButton
                      style={{ marginTop: 50 }}
                      onPress={this._handleOnSpinPress}
                      text="SPIN & WIN"
                    />
                  )}
                </View>
              </View>
            </View>
          </Fragment>
        )}
      </PointsContainer>
    );
  }
}

export default injectIntl(FreeEstmScreen);
