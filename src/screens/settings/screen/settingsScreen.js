import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { groomingServerName } from '../../../utils/settings';

// Constants
import LANGUAGE, { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import CURRENCY, { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { SettingsItem } from '../../../components/settingsItem';

// Styles
import globalStyles from '../../../globalStyles';

class SettingsScreen extends PureComponent {
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
    const {
      handleOnChange,
      intl,
      isDarkTheme,
      isLoggedIn,
      isNotificationSettingsOpen,
      selectedApi,
      selectedCurrency,
      selectedLanguage,
      serverList,
    } = this.props;

    return (
      <View style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'settings.settings',
          })}
        />

        <ScrollView style={globalStyles.settingsContainer}>
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.currency',
            })}
            type="dropdown"
            actionType="currency"
            options={CURRENCY}
            selectedOptionIndex={CURRENCY_VALUE.indexOf(selectedCurrency.currency)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.language',
            })}
            type="dropdown"
            actionType="language"
            options={LANGUAGE}
            selectedOptionIndex={LANGUAGE_VALUE.indexOf(selectedLanguage)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.server',
            })}
            type="dropdown"
            actionType="api"
            options={serverList.map(serverName => groomingServerName(serverName))}
            selectedOptionIndex={serverList.indexOf(selectedApi)}
            defaultText={groomingServerName(selectedApi)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.dark_theme',
            })}
            type="toggle"
            actionType="theme"
            isOn={isDarkTheme}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.push_notification',
            })}
            type="toggle"
            actionType="notification"
            isOn={isNotificationSettingsOpen}
            handleOnChange={handleOnChange}
          />
          {!!isLoggedIn && (
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.pincode',
              })}
              text={intl.formatMessage({
                id: 'settings.reset',
              })}
              type="button"
              actionType="pincode"
              handleOnChange={handleOnChange}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}
export default injectIntl(SettingsScreen);
