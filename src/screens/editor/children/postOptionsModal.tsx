import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import Animated, { FlipInEasyX, FlipOutEasyX } from 'react-native-reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  BeneficiarySelectionContent,
  DateTimePicker,
  MainButton,
  Modal,
  SettingsItem,
} from '../../../components';
import styles from './postOptionsModalStyles';
import ThumbSelectionContent from './thumbSelectionContent';
import PostDescription from './postDescription';

const REWARD_TYPES = [
  {
    key: 'default',
    intlId: 'editor.reward_default',
  },
  {
    key: 'sp',
    intlId: 'editor.reward_power_up',
  },
  {
    key: 'dp',
    intlId: 'editor.reward_decline',
  },
];

export interface PostOptionsModalRef {
  showModal: () => void;
}

interface PostOptionsModalProps {
  body: string;
  draftId: string;
  thumbUrl: string;
  isEdit: boolean;
  isCommunityPost: boolean;
  rewardType: string;
  isUploading: boolean;
  handleRewardChange: (rewardType: string) => void;
  handleThumbSelection: (url: string) => void;
  handleScheduleChange: (datetime: string | null) => void;
  handleShouldReblogChange: (shouldReblog: boolean) => void;
  handleFormUpdate: () => void;
}

const PostOptionsModal = forwardRef(
  (
    {
      body,
      draftId,
      thumbUrl,
      isEdit,
      isCommunityPost,
      rewardType,
      isUploading,
      handleRewardChange,
      handleThumbSelection,
      handleScheduleChange,
      handleShouldReblogChange,
      handleFormUpdate,
    }: PostOptionsModalProps,
    ref,
  ) => {
    const intl = useIntl();

    const [showModal, setShowModal] = useState(false);
    const [rewardTypeIndex, setRewardTypeIndex] = useState(0);
    const [scheduleLater, setScheduleLater] = useState(false);
    const [shouldReblog, setShouldReblog] = useState(false);
    const [scheduledFor, setScheduledFor] = useState('');
    const [disableDone, setDisableDone] = useState(false);
    const [postDescription, setPostDescription] = useState('');

    // removed the useeffect causing index reset bug

    useEffect(() => {
      if (!scheduleLater) {
        handleScheduleChange(null);
      } else if (scheduledFor) {
        handleScheduleChange(scheduledFor);
      }
    }, [scheduleLater, scheduledFor]);

    useEffect(() => {
      handleShouldReblogChange(shouldReblog);
    }, [shouldReblog]);

    useEffect(() => {
      if (!isCommunityPost && shouldReblog) {
        setShouldReblog(false);
      }
    }, [isCommunityPost]);

    // load rewardtype from props if it is already saved in drafts
    useEffect(() => {
      if (rewardType) {
        const rewardTypeKey = REWARD_TYPES.findIndex((item) => item.key === rewardType);
        setRewardTypeIndex(rewardTypeKey);
      }
    }, [rewardType]);

    useImperativeHandle(ref, () => ({
      show: () => {
        setShowModal(true);
      },
    }));

    const _handleRewardChange = (index: number) => {
      setRewardTypeIndex(index);
      const rewardTypeKey = REWARD_TYPES[index].key;
      if (handleRewardChange) {
        handleRewardChange(rewardTypeKey);
      }
    };

    const _handleDatePickerChange = (date: string) => {
      setScheduledFor(date);
    };

    const _onDonePress = () => {
      setShowModal(false);
      handleFormUpdate();
    };

    // handle index change here instead of useeffetc
    const _handleThumbIndexSelection = (url: string) => {
      handleThumbSelection(url);
    };

    const _renderContent = () => (
      <View style={styles.fillSpace}>
        <KeyboardAwareScrollView style={styles.fillSpace}>
          <View style={styles.container}>
            {!isEdit && (
              <>
                <SettingsItem
                  title={intl.formatMessage({ id: 'editor.scheduled_for' })}
                  type="dropdown"
                  actionType="reward"
                  options={[
                    intl.formatMessage({ id: 'editor.scheduled_immediate' }),
                    intl.formatMessage({ id: 'editor.scheduled_later' }),
                  ]}
                  selectedOptionIndex={scheduleLater ? 1 : 0}
                  handleOnChange={(index) => {
                    setScheduleLater(index === 1);
                    if (index !== 1) {
                      handleScheduleChange(null);
                    }
                  }}
                />

                {scheduleLater && (
                  <Animated.View entering={FlipInEasyX.duration(700)}>
                    <DateTimePicker
                      type="datetime"
                      onChanged={_handleDatePickerChange}
                      disabled={true}
                    />
                  </Animated.View>
                )}

                <SettingsItem
                  title={intl.formatMessage({
                    id: 'editor.setting_reward',
                  })}
                  type="dropdown"
                  actionType="reward"
                  options={REWARD_TYPES.map((type) => intl.formatMessage({ id: type.intlId }))}
                  selectedOptionIndex={rewardTypeIndex}
                  handleOnChange={_handleRewardChange}
                />

                {isCommunityPost && (
                  <SettingsItem
                    title={intl.formatMessage({
                      id: 'editor.setting_reblog',
                    })}
                    type="toggle"
                    actionType="reblog"
                    isOn={shouldReblog}
                    handleOnChange={setShouldReblog}
                  />
                )}
              </>
            )}

            <ThumbSelectionContent
              body={body}
              thumbUrl={thumbUrl}
              isUploading={isUploading}
              onThumbSelection={_handleThumbIndexSelection}
            />
            <PostDescription
              postDescription={postDescription}
              handlePostDescriptionChange={setPostDescription}
            />

            {!isEdit && (
              <BeneficiarySelectionContent draftId={draftId} setDisableDone={setDisableDone} />
            )}
          </View>
        </KeyboardAwareScrollView>

        <MainButton
          style={{ ...styles.saveButton }}
          isDisable={disableDone}
          onPress={_onDonePress}
          text={intl.formatMessage({ id: 'editor.done' })}
        />
      </View>
    );

    return (
      <Modal
        isOpen={showModal}
        handleOnModalClose={() => {
          setShowModal(false);
          handleFormUpdate();
        }}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={intl.formatMessage({ id: 'editor.settings_title' })}
        animationType="slide"
        style={styles.modalStyle}
      >
        {_renderContent()}
      </Modal>
    );
  },
);

export default PostOptionsModal;
