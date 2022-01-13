import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useIntl } from 'react-intl';
import { MainButton, SummaryArea, TextInput, UserAvatar } from '..';
import { useSelector, useDispatch } from 'react-redux';
import { generateReplyPermlink } from '../../utils/editor';
import { postComment } from '../../providers/hive/dhive';
import AsyncStorage from '@react-native-community/async-storage';
import { toastNotification } from '../../redux/actions/uiAction';
import { useAppSelector } from '../../hooks';
import { default as ROUTES } from '../../constants/routeNames';
import get from 'lodash/get';
import { navigate } from '../../navigation/service';

export interface QuickReplyModalProps {}

const QuickReplyModal = ({}: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const sheetModalRef = useRef<ActionSheet>();
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true); // or some other action
    });
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false); // or some other action
    });

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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

  // navigate to post on summary press
  const _handleOnSummaryPress = () => {
    Keyboard.dismiss();
    sheetModalRef.current?.setModalVisible(false);
    navigate({
      routeName: ROUTES.SCREENS.POST,
      params: {
        content: selectedPost,
      },
      key: get(selectedPost, 'permlink'),
    });
  };

  // handle submit reply
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
    }
  };

  //VIEW_RENDERERS

  const _renderSummary = () => (
    <TouchableOpacity onPress={() => _handleOnSummaryPress()}>
      <SummaryArea style={styles.summaryStyle} summary={selectedPost.summary} />
    </TouchableOpacity>
  );
  const _renderAvatar = () => (
    <View style={styles.avatarAndNameContainer}>
      <UserAvatar noAction username={currentAccount.username} />
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{`@${currentAccount.username}`}</Text>
      </View>
    </View>
  );

  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        {_renderSummary()}
        {isLoggedIn && _renderAvatar()}
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
      keyboardShouldPersistTaps="handled"
      containerStyle={styles.sheetContent}
      keyboardHandlerEnabled
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    >
      <KeyboardAvoidingView
        behavior={'position'}
        style={{ paddingBottom: Platform.OS === 'ios' ? 0 : !isKeyboardVisible ? 0 : 32 }}
      >
        {selectedPost && _renderContent()}
      </KeyboardAvoidingView>
    </ActionSheet>
  );
};

export default forwardRef(QuickReplyModal as any);
