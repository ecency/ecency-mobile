import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, Text } from 'react-native';

// Components
import { BasicHeader } from '../../../components/basicHeader';

// Styles
import globalStyles from '../../../globalStyles';
// import styles from './draftStyles';

class DraftsScreen extends Component {
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
    const { intl } = this.props;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'boost.title',
          })}
        />
        <Text>sa</Text>
      </View>
    );
  }
}

export default injectIntl(DraftsScreen);
