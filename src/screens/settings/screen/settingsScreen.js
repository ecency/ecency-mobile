import React, { Component, Fragment } from 'react';
import { ScrollView } from 'react-native';

// Constants
import LANGUAGE from '../../../constants/options/language';
import CURRENCY from '../../../constants/options/currency';
import API from '../../../constants/options/api';

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
    const { handleOnChange } = this.props;

    return (
      <Fragment>
        <BasicHeader title="Settings" />

        <ScrollView style={globalStyles.settingsContainer}>
          <SettingsItem
            title="Language"
            type="dropdown"
            actionType="language"
            options={LANGUAGE}
            selectedOptionIndex={0}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Currency"
            type="dropdown"
            actionType="currency"
            options={CURRENCY}
            selectedOptionIndex={0}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Server"
            type="dropdown"
            actionType='api'
            options={API}
            selectedOptionIndex={0}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Push Notification"
            type="toggle"
            isOn
            handleOnChange={handleOnChange}
          />
          <SettingsItem title="Pincode" text="Reset" />
        </ScrollView>
      </Fragment>
    );
  }
}

export default SettingsScreen;
