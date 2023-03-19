import React, { useState, Fragment, useRef } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { injectIntl } from 'react-intl';

// Components
import EStyleSheet from 'react-native-extended-stylesheet';
import { TextButton } from '../..';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';
import { TextInput } from '../../textInput';

// Constants
// Styles
import styles from './basicHeaderStyles';
import { OptionsModal } from '../../atoms';

const BasicHeaderView = ({
  disabled,
  dropdownComponent,
  handleOnPressBackButton,
  handleOnPressClose,
  handleOnPressPreviewButton,
  handleOnSaveButtonPress,
  handleRightIconPress,
  handleBrowserIconPress,
  handleViewModeToggle,
  intl,
  isDraftSaved,
  isDraftSaving,
  isFormValid,
  isHasDropdown,
  isHasIcons,
  isHasSearch,
  isLoading,
  isModalHeader,
  isPreviewActive,
  isReply,
  quickTitle,
  rightButtonText,
  rightIconName,
  isHasBrowserIcon,
  iconType,
  rightIconBtnStyle,
  rightIconStyle,
  title,
  handleOnSubmit,
  handleOnSearch,
  handleRewardChange,
  enableViewModeToggle,
  handleSettingsPress,
  backIconName,
}) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const rewardMenuRef = useRef(null);

  /**
   *
   * ACTION HANDLERS
   *
   */

  const _handleOnPress = () => {
    if (handleOnSubmit) {
      handleOnSubmit();
    }
  };

  const _handleOnDropdownSelect = () => {};

  const _handleSearchButtonPress = () => {
    setIsInputVisible(!isInputVisible);

    if (isInputVisible) {
      _handleOnSearch('');
    }
  };

  const _handleOnSearch = (value) => {
    handleOnSearch(value);
  };

  const _handleRewardMenuSelect = (index) => {
    let rewardType = 'default';

    switch (index) {
      case 1:
        rewardType = 'sp';
        break;
      case 2:
        rewardType = 'dp';
        break;
      default:
        break;
    }

    if (handleRewardChange) {
      handleRewardChange(rewardType);
    }
  };

  /**
   *
   * UI RENDERER
   *
   */

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backWrapper}>
          <IconButton
            iconStyle={[styles.backIcon, isModalHeader && styles.closeIcon]}
            iconType="MaterialIcons"
            name={backIconName || 'arrow-back'}
            onPress={() => (isModalHeader ? handleOnPressClose() : handleOnPressBackButton())}
            disabled={disabled}
          />
          {isHasIcons && !isReply && (
            <IconButton
              style={{ marginHorizontal: 20 }}
              iconStyle={[styles.gearIcon, isModalHeader && styles.closeIcon]}
              iconType="MaterialIcons"
              name="settings"
              onPress={handleSettingsPress && handleSettingsPress}
              disabled={disabled}
            />
          )}
          {!isInputVisible && (
            <Text style={[title && styles.title, quickTitle && styles.quickTitle]}>
              {quickTitle || title}
            </Text>
          )}
          {isHasDropdown && (
            <View>
              {dropdownComponent ? (
                <Fragment>{dropdownComponent}</Fragment>
              ) : (
                <DropdownButton
                  isHasChildIcon
                  iconName="md-more"
                  options={['ALL ACTIVITIES', 'VOTES', 'REPLIES', 'MENTIONS', 'FOLLOWS', 'REBLOGS']}
                  onSelect={_handleOnDropdownSelect}
                />
              )}
            </View>
          )}
  
          {rightIconName && !isHasSearch && (
            <IconButton
              size={25}
              onPress={() => handleRightIconPress()}
              iconStyle={[styles.rightIcon, rightIconStyle]}
              style={rightIconBtnStyle}
              name={rightIconName}
              iconType={iconType}
            />
          )}

          {enableViewModeToggle && (
            <IconButton
              size={24}
              iconStyle={styles.rightIcon}
              name="view-module"
              iconType="MaterialIcons"
              onPress={handleViewModeToggle}
            />
          )}

          {isInputVisible && (
            <TextInput
              onChangeText={_handleOnSearch}
              autoFocus
              placeholder={intl.formatMessage({
                id: 'basic_header.search',
              })}
              placeholderTextColor="#c1c5c7"
              autoCapitalize="none"
              style={styles.textInput}
            />
          )}

          {isHasSearch && (
            <IconButton
              size={22}
              onPress={() => _handleSearchButtonPress()}
              iconStyle={styles.rightIcon}
              iconType="MaterialIcons"
              name={isInputVisible ? 'close' : 'search'}
            />
          )}

          {isHasBrowserIcon && !isHasSearch && (
            <IconButton
              size={28}
              onPress={() => handleBrowserIconPress()}
              iconStyle={styles.rightIcon}
              name={'open-in-browser'}
              iconType={'MaterialIcons'}
            />
          )}

        </View>

        {isHasIcons && (
          <Fragment>
            {!isReply && (
              <Fragment>
                {!isDraftSaving ? (
                  <IconButton
                    iconStyle={[styles.saveIcon, isDraftSaved && styles.savedIcon]}
                    iconType="MaterialIcons"
                    name="save"
                    size={25}
                    onPress={() => handleOnSaveButtonPress && handleOnSaveButtonPress()}
                  />
                ) : (
                  <ActivityIndicator
                    style={styles.textButtonWrapper}
                    color={EStyleSheet.value('$primaryBlue')}
                  />
                )}
              </Fragment>
            )}
            <IconButton
              style={styles.iconButton}
              size={25}
              onPress={() => handleOnPressPreviewButton()}
              iconStyle={styles.rightIcon}
              iconType="MaterialCommunityIcons"
              name={isPreviewActive ? 'eye-off' : 'eye'}
            />
            {!isLoading ? (
              <TextButton
                textStyle={[
                  styles.textButton,
                  isFormValid ? styles.textButtonEnable : styles.textButtonDisable,
                ]}
                onPress={isFormValid && _handleOnPress}
                style={styles.textButtonWrapper}
                text={rightButtonText}
              />
            ) : (
              <ActivityIndicator
                style={[styles.textButtonWrapper]}
                color={EStyleSheet.value('$primaryBlue')}
              />
            )}
          </Fragment>
        )}
      </View>

      <OptionsModal
        ref={rewardMenuRef}
        options={[
          intl.formatMessage({ id: 'editor.reward_default' }),
          intl.formatMessage({ id: 'editor.reward_power_up' }),
          intl.formatMessage({ id: 'editor.reward_decline' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        cancelButtonIndex={3}
        title="Reward"
        onPress={_handleRewardMenuSelect}
      />
    </SafeAreaView>
  );
};

export default injectIntl(BasicHeaderView);
