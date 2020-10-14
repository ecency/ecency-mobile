import React, { useState, Fragment, useRef } from 'react';
import { View, Text, ActivityIndicator, SafeAreaView } from 'react-native';
import { injectIntl } from 'react-intl';
import ActionSheet from 'react-native-actionsheet';
import { useSelector } from 'react-redux';

// Components
import { TextButton, Modal, BeneficiaryModal } from '../..';
import { IconButton } from '../../iconButton';
import { DropdownButton } from '../../dropdownButton';
import { TextInput } from '../../textInput';
import { DateTimePicker } from '../../dateTimePicker';

// Constants
// Styles
import styles from './basicHeaderStyles';

const BasicHeaderView = ({
  disabled,
  dropdownComponent,
  handleOnPressBackButton,
  handleOnPressClose,
  handleOnPressPreviewButton,
  handleOnSaveButtonPress,
  handleRightIconPress,
  intl,
  isDraftSaved,
  isDraftSaving,
  isFormValid,
  isHasDropdown,
  isHasIcons,
  isHasSearch,
  isLoading,
  isLoggedIn,
  isModalHeader,
  isPreviewActive,
  isReply,
  quickTitle,
  rightButtonText,
  rightIconName,
  title,
  handleOnSubmit,
  handleOnSearch,
  handleDatePickerChange,
  handleRewardChange,
  handleBeneficiaries,
}) => {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [beneficiaryModal, setBeneficiaryModal] = useState(false);

  const username = useSelector((state) => state.account.currentAccount.name);

  const settingMenuRef = useRef(null);
  const rewardMenuRef = useRef(null);
  const scheduleRef = useRef(null);

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

  const _handleSettingMenuSelect = (index) => {
    switch (index) {
      case 0:
        scheduleRef.current.onPressDate();
        break;
      case 1:
        rewardMenuRef.current.show();
        break;
      case 2:
        setBeneficiaryModal(true);
        break;

      default:
        break;
    }
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

  const _handleOnSaveBeneficiaries = (beneficiaries) => {
    const _beneficiaries = beneficiaries.map((item) => ({
      account: item.account,
      weight: item.weight,
    }));
    setBeneficiaryModal(false);
    if (handleBeneficiaries) {
      handleBeneficiaries(_beneficiaries);
    }
  };

  const _handleDatePickerChange = (datePickerValue) => {
    if (handleDatePickerChange) {
      handleDatePickerChange(datePickerValue);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.backWrapper}>
          <IconButton
            iconStyle={[styles.backIcon, isModalHeader && styles.closeIcon]}
            iconType="MaterialIcons"
            name="arrow-back"
            onPress={() => (isModalHeader ? handleOnPressClose() : handleOnPressBackButton())}
            disabled={disabled}
          />
          {isHasIcons && !isReply && (
            <IconButton
              style={{ marginHorizontal: 20 }}
              iconStyle={[styles.backIcon, isModalHeader && styles.closeIcon]}
              iconType="MaterialIcons"
              name="settings"
              onPress={() => settingMenuRef.current.show()}
              disabled={disabled}
            />
          )}
          <DateTimePicker
            type="date-time"
            onSubmit={_handleDatePickerChange}
            disabled={!isFormValid}
            ref={scheduleRef}
          />
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
              iconStyle={styles.rightIcon}
              name={rightIconName}
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
                  <ActivityIndicator style={styles.textButtonWrapper} />
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
              <ActivityIndicator style={[styles.textButtonWrapper]} />
            )}
          </Fragment>
        )}
      </View>
      <Modal
        isOpen={beneficiaryModal}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        handleOnModalClose={() => setBeneficiaryModal(false)}
        title={intl.formatMessage({ id: 'editor.beneficiaries' })}
        animationType="slide"
      >
        <BeneficiaryModal
          username={username}
          handleOnSaveBeneficiaries={_handleOnSaveBeneficiaries}
        />
      </Modal>
      <ActionSheet
        ref={settingMenuRef}
        options={[
          intl.formatMessage({ id: 'editor.setting_schedule' }),
          intl.formatMessage({ id: 'editor.setting_reward' }),
          intl.formatMessage({ id: 'editor.setting_beneficiary' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        cancelButtonIndex={3}
        title={intl.formatMessage({ id: 'alert.delete' })}
        onPress={_handleSettingMenuSelect}
      />
      <ActionSheet
        ref={rewardMenuRef}
        options={[
          intl.formatMessage({ id: 'editor.reward_default' }),
          intl.formatMessage({ id: 'editor.reward_power_up' }),
          intl.formatMessage({ id: 'editor.reward_decline' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        cancelButtonIndex={3}
        title="test"
        onPress={_handleRewardMenuSelect}
      />
    </SafeAreaView>
  );
};

export default injectIntl(BasicHeaderView);
