import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { MainButton, SummaryArea, TextInput, UserAvatar } from '..';
import { useSelector, useDispatch } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateReplyPermlink } from '../../utils/editor';
import { postComment } from '../../providers/hive/dhive';
import AsyncStorage from '@react-native-community/async-storage';
import { toastNotification } from '../../redux/actions/uiAction';

export interface QuickReplyModalProps {}

const QuickReplyModal = ({}: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [isSending, setIsSending] = useState(false);
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

  // handlers
  const _submitReply = async () => {
    let stateTimer;
    if (isSending) {
      return;
    }

    if (currentAccount) {
      setIsSending(true);

      const permlink = generateReplyPermlink(selectedPost.author);

      const parentAuthor = selectedPost.author;
      const parentPermlink = selectedPost.permlink;
      const parentTags = selectedPost.json_metadata.tags;
      console.log(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        commentValue,
        parentTags,
      );

      const status = await postComment(
        currentAccount,
        pinCode,
        parentAuthor,
        parentPermlink,
        permlink,
        commentValue,
        parentTags,
      )
        .then(() => {
          AsyncStorage.setItem('temp-reply', '');

          stateTimer = setTimeout(() => {
            setIsSending(false);
            sheetModalRef.current?.setModalVisible(false);
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.success',
                }),
              ),
            );
            clearTimeout(stateTimer);
          }, 3000);
        })
        .catch((error) => {
          console.log(error);
          Alert.alert(
            intl.formatMessage({
              id: 'alert.fail',
            }),
            error.message || JSON.stringify(error),
          );
          stateTimer = setTimeout(() => {
            setIsSending(false);
            clearTimeout(stateTimer);
          }, 500);
        });
      console.log('status : ', status);

      // fetch posts again
      // await loadPosts({ shouldReset: true });
    }
  };

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
            onPress={() => _submitReply()}
            text={intl.formatMessage({
              id: 'quick_reply.reply',
            })}
            isLoading={isSending}
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
