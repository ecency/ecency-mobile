import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { MainButton, SummaryArea, TextInput, UserAvatar } from '..';
import { useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export interface QuickReplyModalProps {}

const QuickReplyModal = ({}: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const currentAccount = useSelector((state) => state.account.currentAccount);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sheetModalRef = useRef<ActionSheet>();
  const inputRef = useRef<TextInput>(null);

  // reset the state when post changes
  useEffect(() => {
    setCommentValue('');
  }, [selectedPost]);

  //CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
    show: (post: any) => {
      console.log('Showing action modal');
      setSelectedPost(post);
      sheetModalRef.current?.setModalVisible(true);
      // wait  for modal to open and then show the keyboard
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1000);
    },
  }));

  //VIEW_RENDERERS

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        <SummaryArea summary={selectedPost.summary} />
        <View style={styles.avatarAndNameContainer}>
          <UserAvatar noAction username={currentAccount.username} />
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{`@${currentAccount.username}`}</Text>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            innerRef={inputRef}
            onChangeText={setCommentValue}
            value={commentValue}
            // autoFocus
            placeholder={intl.formatMessage({
              id: 'quick_reply.placeholder',
            })}
            placeholderTextColor="#c1c5c7"
            autoCapitalize="none"
            style={styles.textInput}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.footer}>
          <MainButton
            style={styles.commentBtn}
            onPress={() => console.log('comment pressed!')}
            text={intl.formatMessage({
              id: 'quick_reply.reply',
            })}
            isLoading={isLoading}
          />
        </View>
      </View>
    );
  };

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={true}
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <KeyboardAwareScrollView enableOnAndroid={true}>
        {selectedPost && _renderContent()}
      </KeyboardAwareScrollView>
    </ActionSheet>
  );
};

export default forwardRef(QuickReplyModal);
