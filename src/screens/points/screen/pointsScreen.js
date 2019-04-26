import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import { View } from 'react-native';
// Constants

// Components
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';
import { Points } from '../../../components/points';

// Styles
import styles from './pointsStyles';

class PointsScreen extends PureComponent {
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

  render() {
    const { intl, isLoggedIn, handleLoginPress } = this.props;

    return (
      <View style={styles.container}>
        <Header />
        {isLoggedIn ? (
          <Points />
        ) : (
          <NoPost
            style={styles.noPostContainer}
            isButtonText
            defaultText={intl.formatMessage({
              id: 'profile.login_to_see',
            })}
            handleOnButtonPress={handleLoginPress}
          />
        )}
      </View>
    );
  }
}

export default injectIntl(PointsScreen);
