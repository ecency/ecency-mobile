import React, { Component, Fragment } from 'react';
import { ScrollView } from 'react-native';

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
  _handleOnChange = (action, type) => {
    console.log(action + type);
  };

  render() {
    return (
      <Fragment>
        <BasicHeader title="Settings" />

        <ScrollView style={globalStyles.settingsContainer}>
          <SettingsItem
            title="Language"
            type="dropdown"
            options={['Turkish', 'German', 'Turkish']}
            selectedOptionIndex={0}
            handleOnChange={this._handleOnChange}
          />
          <SettingsItem
            title="Currency"
            type="dropdown"
            options={['USD', 'TRY', 'CYH']}
            selectedOptionIndex={0}
            handleOnChange={this._handleOnChange}
          />
          <SettingsItem title="Push Notification" type="toggle" isOn />
          <SettingsItem title="Pincode" text="Reset" />
        </ScrollView>
      </Fragment>
    );
  }
}

export default SettingsScreen;
