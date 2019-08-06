import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';
import get from 'lodash/get';
import wheel from './wheel.png';
import marker from './marker.png';
// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { SpinGame } from '../../../components';

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
      rouletteState: '',
      option: '',
      rouletteCustomState: 'stop',
      optionCustom: '',
    };
  }

  _onRotateChange(state) {
    this.setState({
      rouletteState: state,
    });
  }

  _onRotate(option) {
    this.setState({
      option: option.index,
    });
  }

  _onRotateCustomChange(state) {
    // this.setState({
    //   rouletteCustomState: state,
    // });
  }

  _onRotateCustom(option) {
    this.setState({
      optionCustom: option.props.index,
    });
  }

  render() {
    const { intl } = this.props;
    const numbers = [
      100,
      320,
      150,
      192,
      43,
      213,
      23,
      235,
      137,
      334,
      633,
      273,
      133,
      363,
      113,
      303,
      83,
      233,
      130,
      53,
      234,
      136,
      33,
    ];
    const options = numbers.map(o => ({ index: o }));
    const { rouletteCustomState, rouletteState, option, optionCustom } = this.state;

    //   const options = numbers.map(o => ({ index: o }));
    const customOptions = numbers.map(o => <Text index={o}>{o}</Text>);
    return (
      <PointsContainer>
        {({ isLoading, balance: _balance }) => (
          <Fragment>
            <BasicHeader title={intl.formatMessage({ id: 'free_estm.title' })} />
            <View style={styles.container}>
              <Text>{rouletteState}</Text>
              <Text>{option}</Text>
              <Text>{optionCustom}</Text>

              <SpinGame
                enableUserRotate={rouletteCustomState === 'stop'}
                background={null}
                onRotate={_option =>
                  this.setState({
                    optionCustom: _option.props.index,
                  })
                }
                onRotateChange={state =>
                  this.setState({
                    rouletteCustomState: state,
                  })
                }
                marker={marker}
                options={customOptions}
                rotateEachElement={index => ((index * 360) / options.length) * -1 - 90}
                markerWidth={20}
              />
            </View>
          </Fragment>
        )}
      </PointsContainer>
    );
  }
}

export default injectIntl(FreeEstmScreen);
