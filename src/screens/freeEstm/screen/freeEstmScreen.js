import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { TouchableOpacity, Text, View } from 'react-native';

// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { BoostIndicatorAnimation, MainButton } from '../../../components';
import TagCloud from './tagCloud';
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
                <View style={{ position: 'absolute', left: -110, top: 20 }}>
                  {!isSpinning && (
                    <TagCloud
                      tagList={[
                        { title: '110 ESTM', point: 3 },
                        { title: '130 ESTM', point: 2 },
                        { title: '30 ESTM', point: 1 },
                        { title: '1 ESTM', point: 0 },
                        { title: '200 ESTM', point: 3 },
                        { title: '80 ESTM', point: 1 },
                        { title: '1 ESTM', point: 2 },
                        { title: '10 ESTM', point: 0 },
                        { title: '20 ESTM', point: 0 },
                        { title: '110 ESTM', point: 1 },
                        { title: '110 ESTM', point: 1 },
                        { title: '30 ESTM', point: 2 },
                        { title: '50 ESTM', point: 1 },
                        { title: '1 ESTM', point: 0 },
                        { title: '90 ESTM', point: 2 },
                        { title: '120 ESTM', point: 2 },
                        { title: '500 ESTM', point: 3 },
                        { title: '1000 ESTM', point: 5 },
                        { title: '2000 ESTM', point: 4 },
                      ]}
                    />
                  )}
                </View>
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
