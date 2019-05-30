import React, { PureComponent, Fragment } from 'react';
import { ScrollView, View } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { groomingServerName } from '../../../utils/settings';

// Constants
import LANGUAGE, { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import CURRENCY, { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import NSFW from '../../../constants/options/nsfw';

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { SettingsItem } from '../../../components/settingsItem';
import { CollapsibleCard } from '../../../components/collapsibleCard';

// Styles
import styles from './settingsStyles';

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
      nsfw,
      selectedApi,
      selectedCurrency,
      selectedLanguage,
      serverList,
      isNotificationMenuOpen,
      commentNotification,
      followNotification,
      mentionNotification,
      reblogNotification,
      transfersNotification,
      voteNotification,
      handleOnButtonPress,
    } = this.props;

    return (
      <Fragment>
        <BasicHeader
          title={intl.formatMessage({
            id: 'settings.settings',
          })}
        />

        <ScrollView style={styles.container}>
          <View style={styles.settingsCard}>
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.general',
              })}
              titleStyle={styles.cardTitle}
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
                id: 'settings.nsfw_content',
              })}
              type="dropdown"
              actionType="nsfw"
              options={NSFW.map(item =>
                intl.formatMessage({
                  id: item,
                }),
              )}
              selectedOptionIndex={parseInt(nsfw, 10)}
              handleOnChange={handleOnChange}
            />
            {!!isLoggedIn && (
              <Fragment>
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.pincode',
                  })}
                  text={intl.formatMessage({
                    id: 'settings.reset',
                  })}
                  type="button"
                  actionType="pincode"
                  handleOnButtonPress={handleOnButtonPress}
                />
              </Fragment>
              //  <SettingsItem
              //   title={intl.formatMessage({
              //     id: 'settings.default_footer',
              //   })}
              //   type="toggle"
              //   actionType="default_footer"
              //   isOn={isDefaultFooter}
              //   handleOnChange={handleOnChange}
              // />
            )}
          </View>
          {!!isLoggedIn && (
            <View style={styles.settingsCard}>
              <CollapsibleCard
                titleComponent={
                  <SettingsItem
                    title={intl.formatMessage({
                      id: 'settings.push_notification',
                    })}
                    titleStyle={styles.cardTitle}
                    type="toggle"
                    actionType="notification"
                    isOn={isNotificationSettingsOpen}
                    handleOnChange={handleOnChange}
                  />
                }
                noBorder
                fitContent
                locked
                isExpanded={isNotificationSettingsOpen}
                expanded={isNotificationMenuOpen}
              >
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.follow',
                  })}
                  type="toggle"
                  actionType="notification.follow"
                  isOn={followNotification}
                  handleOnChange={handleOnChange}
                />
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.vote',
                  })}
                  type="toggle"
                  actionType="notification.vote"
                  isOn={voteNotification}
                  handleOnChange={handleOnChange}
                />
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.comment',
                  })}
                  type="toggle"
                  actionType="notification.comment"
                  isOn={commentNotification}
                  handleOnChange={handleOnChange}
                />
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.mention',
                  })}
                  type="toggle"
                  actionType="notification.mention"
                  isOn={mentionNotification}
                  handleOnChange={handleOnChange}
                />
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.reblog',
                  })}
                  type="toggle"
                  actionType="notification.reblog"
                  isOn={reblogNotification}
                  handleOnChange={handleOnChange}
                />
                <SettingsItem
                  title={intl.formatMessage({
                    id: 'settings.notification.transfers',
                  })}
                  type="toggle"
                  actionType="notification.transfers"
                  isOn={transfersNotification}
                  handleOnChange={handleOnChange}
                />
              </CollapsibleCard>
            </View>
          )}
          <View style={[styles.settingsCard, styles.paddingBottom]}>
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.send_feedback',
              })}
              text={intl.formatMessage({
                id: 'settings.send',
              })}
              type="button"
              actionType="feedback"
              handleOnButtonPress={handleOnButtonPress}
            />
          </View>
        </ScrollView>
      </Fragment>
    );
  }
}
export default injectIntl(SettingsScreen);
