import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';
import get from 'lodash/get';

// Container
import { PointsContainer } from '../../../containers';

// Components
import { BasicHeader } from '../../../components/basicHeader';

// Styles
import styles from './freeEstmStyles';

class FreeEstmScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { intl } = this.props;

    return (
      <PointsContainer>
        {({ isLoading, balance: _balance }) => (
          <Fragment>
            <BasicHeader title={intl.formatMessage({ id: 'free_estm.title' })} />
            <View style={styles.container}>
              <Text>free esteem</Text>
            </View>
          </Fragment>
        )}
      </PointsContainer>
    );
  }
}

export default injectIntl(FreeEstmScreen);
