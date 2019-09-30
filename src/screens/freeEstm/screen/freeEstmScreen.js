import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Image, ImageBackground, Text, View } from 'react-native';

// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { BoostIndicatorAnimation, MainButton, Icon } from '../../../components';

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
      earnedPoints: null,
    };
  }

  _handleOnSpinPress = () => {
    const { spinRight } = this.state;

    this.setState({
      isSpinning: true,
      spinRight: spinRight - 1,
    });

    setTimeout(() => {
      this.setState({ isSpinning: false, earnedPoints: 10 });
    }, 8000);
  };

  _buySpinRight = () => {
    alert('buy me');
  };

  render() {
    const { intl } = this.props;
    const { isSpinning, spinRight, earnedPoints } = this.state;

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
                {!isSpinning && spinRight > 0 && (
                  <Image source={ESTM_TAGS} style={styles.backgroundTags} />
                )}
                <BoostIndicatorAnimation key={spinRight} isSpinning={isSpinning} />

                {earnedPoints && (
                  <View style={styles.descriptionWrapper}>
                    <Fragment>
                      <Text style={styles.description}>{`${earnedPoints} ESTM`}</Text>
                      <View style={styles.triangle} />
                    </Fragment>
                  </View>
                )}

                <View style={{ flex: 1 }}>
                  {!isSpinning && (
                    <MainButton
                      style={styles.button}
                      onPress={spinRight > 0 ? this._handleOnSpinPress : this._buySpinRight}
                    >
                      <View style={styles.buttonContent}>
                        <Text style={styles.buttonText}>
                          {intl.formatMessage({
                            id: spinRight > 0 ? 'free_estm.button' : 'free_estm.get_spin',
                          })}
                        </Text>
                        {spinRight <= 0 && (
                          <View style={styles.buttonIconWrapper}>
                            <Icon name="add" iconType="MaterialIcons" color="#357ce6" size={23} />
                          </View>
                        )}
                      </View>
                    </MainButton>
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
