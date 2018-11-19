import React, { Component, Fragment } from 'react';
import { ScrollView, Text } from 'react-native';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { SettingsItem } from '../../../components/settingsItem';
// Styles
import globalStyles from '../../../globalStyles';

class SettingsScreen extends Component {
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
    return (
      <Fragment>
        <BasicHeader title="Settings" />

        <ScrollView style={globalStyles.settingsContainer}>
          <SettingsItem title="Currency">
            <Text>ugur</Text>
          </SettingsItem>
        </ScrollView>
      </Fragment>
    );
  }
}

export default SettingsScreen;
