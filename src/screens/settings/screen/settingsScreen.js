import React, { Component, Fragment } from 'react';
import { ScrollView } from 'react-native';

// Constants
import LANGUAGE, { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import CURRENCY, { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import API, { VALUE as API_VALUE } from '../../../constants/options/api';

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
    const { handleOnChange, selectedLanguage, selectedApi, selectedCurrency, isNotificationOpen, isDarkTheme } = this.props;

    return (
      <Fragment>
        <BasicHeader title="Settings" />

        <ScrollView style={globalStyles.settingsContainer}>
          <SettingsItem
            title="Language"
            type="dropdown"
            actionType="language"
            options={LANGUAGE}
            selectedOptionIndex={LANGUAGE_VALUE.indexOf(selectedLanguage)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Currency"
            type="dropdown"
            actionType="currency"
            options={CURRENCY}
            selectedOptionIndex={CURRENCY_VALUE.indexOf(selectedCurrency)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Server"
            type="dropdown"
            actionType='api'
            options={API}
            selectedOptionIndex={API_VALUE.indexOf(selectedApi)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Dark Theme"
            type="toggle"
            actionType='theme'
            isOn={isDarkTheme}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title="Push Notification"
            type="toggle"
            actionType='notification'
            isOn={isNotificationOpen}
            handleOnChange={handleOnChange}
          />
          <SettingsItem title="Pincode" text="Reset" />
        </ScrollView>
      </Fragment>
    );
  }
}

export default SettingsScreen;
