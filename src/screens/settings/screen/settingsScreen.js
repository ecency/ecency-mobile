/* eslint-disable react/jsx-wrap-multilines */
import React, { Fragment } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { injectIntl } from 'react-intl';

// Utils
import { groomingServerName } from '../../../utils/settings';

// Constants
import LANGUAGE, { VALUE as LANGUAGE_VALUE } from '../../../constants/options/language';
import CURRENCY, { VALUE as CURRENCY_VALUE } from '../../../constants/options/currency';
import NSFW from '../../../constants/options/nsfw';
import THEME_OPTIONS from '../../../constants/options/theme';

// Components
import { BasicHeader, SettingsItem, CollapsibleCard } from '../../../components';

// Styles
import styles from './settingsStyles';
import settingsTypes from '../../../constants/settingsTypes';

const SettingsScreen = ({
  handleOnChange,
  intl,
  isDarkTheme,
  colorThemeIndex,
  isPinCodeOpen,
  isBiometricEnabled,
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
  favoriteNotification,
  bookmarkNotification,
  reblogNotification,
  transfersNotification,
  voteNotification,
  handleOnButtonPress,
  isLoading,
  isHideImages,
}) => {
  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'settings.settings',
        })}
      />

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            progressBackgroundColor="#357CE6"
            tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
            titleColor="#fff"
            colors={['#fff']}
          />
        }
      >
        <View style={styles.settingsCard}>
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.general',
            })}
            titleStyle={styles.cardTitle}
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
            options={serverList.map((serverName) => groomingServerName(serverName))}
            selectedOptionIndex={serverList.indexOf(selectedApi)}
            defaultText={
              groomingServerName(selectedApi) ||
              intl.formatMessage({
                id: 'alert.checking',
              })
            }
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.nsfw_content',
            })}
            type="dropdown"
            actionType="nsfw"
            options={NSFW.map((item) =>
              intl.formatMessage({
                id: item,
              }),
            )}
            selectedOptionIndex={parseInt(nsfw, 10)}
            handleOnChange={handleOnChange}
          />
          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.color_theme',
            })}
            type="dropdown"
            actionType="theme"
            options={THEME_OPTIONS.map((item) =>
              intl.formatMessage({
                id: item.key,
              }),
            )}
            selectedOptionIndex={colorThemeIndex}
            handleOnChange={handleOnChange}
          />

          <SettingsItem
            title={intl.formatMessage({
              id: 'settings.show_imgs',
            })}
            text={intl.formatMessage({
              id: 'settings.show_imgs',
            })}
            type="toggle"
            actionType={settingsTypes.SHOW_HIDE_IMGS}
            handleOnChange={handleOnChange}
            isOn={!isHideImages}
          />

          {!!isLoggedIn && (
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.pincode',
              })}
              type="toggle"
              actionType="pincode"
              isOn={isPinCodeOpen}
              toggleLatchBack={true}
              handleOnChange={handleOnChange}
            />
          )}

          {!!isLoggedIn && !!isPinCodeOpen && (
            <Fragment>
              <SettingsItem
                title={intl.formatMessage({
                  id: 'settings.biometric',
                })}
                type="toggle"
                actionType="biometric"
                isOn={isBiometricEnabled}
                toggleLatchBack={true}
                handleOnChange={handleOnChange}
              />

              <SettingsItem
                title={intl.formatMessage({
                  id: 'settings.reset_pin',
                })}
                text={intl.formatMessage({
                  id: 'settings.reset',
                })}
                type="button"
                actionType="reset_pin"
                toggleLatchBack={true}
                handleOnButtonPress={handleOnButtonPress}
              />
            </Fragment>
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
                  id: 'settings.notification.favorite',
                })}
                type="toggle"
                actionType="notification.favorite"
                isOn={favoriteNotification}
                handleOnChange={handleOnChange}
              />
              <SettingsItem
                title={intl.formatMessage({
                  id: 'settings.notification.bookmark',
                })}
                type="toggle"
                actionType="notification.bookmark"
                isOn={bookmarkNotification}
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
          {!!isLoggedIn && (
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.backup_private_keys',
              })}
              text={intl.formatMessage({
                id: 'settings.backup',
              })}
              type="button"
              actionType={settingsTypes.BACKUP_PRIVATE_KEYS}
              handleOnButtonPress={handleOnButtonPress}
            />
          )}
          {!!isLoggedIn && (
            <SettingsItem
              title={intl.formatMessage({
                id: 'settings.delete_account',
              })}
              text={intl.formatMessage({
                id: 'settings.delete_account',
              })}
              type="icon"
              iconName="delete-forever"
              actionType={settingsTypes.DELETE_ACCOUNT}
              handleOnButtonPress={handleOnButtonPress}
            />
          )}
        </View>
      </ScrollView>
    </Fragment>
  );
};
export default injectIntl(SettingsScreen);
/* eslint-enable */
