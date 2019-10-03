import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { Image, Text, View } from 'react-native';

// Components
import { BoostIndicatorAnimation, MainButton, Icon, BasicHeader } from '..';

import ESTM_TAGS from '../../assets/estmTags.png';

// Styles
import styles from './spinGameStyles';

class SpinGameView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      isSpinning: false,
    };
  }

  _handleOnSpinPress = () => {
    const { spin } = this.props;
    spin();

    this.setState({
      isSpinning: true,
    });

    setTimeout(() => {
      this.setState({ isSpinning: false });
    }, 8000);
  };

  _buySpinRight = () => {
    alert('buy me');
  };

  render() {
    const { intl, gameRight, score } = this.props;
    const { isSpinning } = this.state;

    return (
      <Fragment>
        <BasicHeader title={intl.formatMessage({ id: 'free_estm.title' })} />
        <View style={styles.container}>
          <View style={styles.textWrapper}>
            {!isSpinning && (
              <Fragment>
                <Text style={styles.count}>{gameRight}</Text>
                <Text style={styles.countDesc}>Spin Left</Text>
              </Fragment>
            )}
          </View>
          <View style={styles.spinnerWrapper}>
            {!isSpinning && gameRight > 0 && (
              <Image source={ESTM_TAGS} style={styles.backgroundTags} />
            )}
            <BoostIndicatorAnimation key={gameRight} isSpinning={isSpinning} />

            {!isSpinning && score > 0 && (
              <View style={styles.descriptionWrapper}>
                <Fragment>
                  <Text style={styles.description}>{`${score} ESTM`}</Text>
                  <View style={styles.triangle} />
                </Fragment>
              </View>
            )}

            <View style={{ flex: 1 }}>
              {!isSpinning && (
                <MainButton
                  style={styles.button}
                  onPress={gameRight > 0 ? this._handleOnSpinPress : this._buySpinRight}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>
                      {intl.formatMessage({
                        id: gameRight > 0 ? 'free_estm.button' : 'free_estm.get_spin',
                      })}
                    </Text>
                    {gameRight <= 0 && (
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
    );
  }
}

export default injectIntl(SpinGameView);
