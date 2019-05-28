import React, { PureComponent, Fragment } from 'react';
import { View, Text } from 'react-native';

// Constants

// Components

import { Logo } from '../../../components';

// import styles from './launchStyles';

class LaunchScreen extends PureComponent {
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
    return <Fragment />;

    // Temporarily removed
    // return (
    //   <View
    //     style={{
    //       flex: 1,
    //       justifyContent: 'center',
    //       alignItems: 'center',
    //       marginBottom: 130,
    //     }}
    //   >
    //     <Logo style={{ width: 130, height: 130 }} />
    //     {/* <Text style={{ fontSize: 24 }}>eSteem</Text>
    //     <Text style={{ fontSize: 24 }}>mobile</Text> */}
    //   </View>
    // );
  }
}

export default LaunchScreen;
