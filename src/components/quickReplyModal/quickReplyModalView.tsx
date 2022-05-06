import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import ActionSheet from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { forwardRef } from 'react';
import { View, Text, Alert, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import { IconButton, MainButton, SummaryArea, TextButton, TextInput, UserAvatar } from '..';
import { useSelector, useDispatch } from 'react-redux';
import { generateReplyPermlink } from '../../utils/editor';
import { postComment } from '../../providers/hive/dhive';
import { toastNotification } from '../../redux/actions/uiAction';
import { updateCommentCache } from '../../redux/actions/cacheActions';
import { default as ROUTES } from '../../constants/routeNames';
import get from 'lodash/get';
import { navigate } from '../../navigation/service';
import { postBodySummary } from '@ecency/render-helper';

export interface QuickReplyModalProps {
  fetchPost?: any;
}

const QuickReplyModal = ({ fetchPost }: QuickReplyModalProps, ref) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useSelector((state) => state.account.currentAccount);
  const pinCode = useSelector((state) => state.application.pin);

  const [selectedPost, setSelectedPost] = useState(null);
  const [commentValue, setCommentValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const sheetModalRef = useRef<ActionSheet>();
  const inputRef = useRef<TextInput>(null);

  const headerText =
    selectedPost && (selectedPost.summary || postBodySummary(selectedPost, 150, Platform.OS));

  // reset the state when post changes
  useEffect(() => {
    setCommentValue('');
  }, [selectedPost]);

  //CALLBACK_METHODS
  useImperativeHandle(ref, () => ({
    show: (post: any) => {
      setSelectedPost(post);
      sheetModalRef.current?.setModalVisible(true);
      // wait  for modal to open and then show the keyboard
      setTimeout(() => {
        inputRef.current?.focus();
      }, 1000);
    },
  }));

  // handlers

  // handle close press
  const _handleClosePress = () => {
    sheetModalRef.current?.setModalVisible(false);
  };
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
    if (!commentValue) {
      return;
    }
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
          stateTimer = setTimeout(() => {
            setIsSending(false);
            sheetModalRef.current?.setModalVisible(false);
            setCommentValue('');
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.success',
                }),
              ),
            );

            //add comment cache entry
            dispatch(
              updateCommentCache(
                `${parentAuthor}/${parentPermlink}`,
                {
                  author: currentAccount.name,
                  permlink,
                  parent_author: parentAuthor,
                  parent_permlink: parentPermlink,
                  markdownBody: commentValue,
                },
                {
                  parentTags: parentTags || ['ecency'],
                },
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

  const _handleExpandBtn = () => {
    if (selectedPost) {
      navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        key: 'editor_replay',
        params: {
          isReply: true,
          post: selectedPost,
          quickReplyText: commentValue,
          fetchPost,
        },
      });
      sheetModalRef.current?.setModalVisible(false);
    }
  };
  //VIEW_RENDERERS

  const _renderSheetHeader = () => (
    <View style={styles.modalHeader}>
      <IconButton
        name="close"
        iconType="MaterialCommunityIcons"
        size={28}
        color={EStyleSheet.value('$primaryBlack')}
        iconStyle={{}}
        onPress={() => _handleClosePress()}
      />
    </View>
  );

  const _renderSummary = () => (
    <TouchableOpacity onPress={() => _handleOnSummaryPress()}>
      <SummaryArea style={styles.summaryStyle} summary={headerText} />
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

  const _renderExpandBtn = () => (
    <View style={styles.expandBtnContainer}>
      <IconButton
        iconStyle={styles.backIcon}
        iconType="MaterialCommunityIcons"
        name="arrow-expand"
        onPress={_handleExpandBtn}
        size={28}
        color={EStyleSheet.value('$primaryBlack')}
      />
    </View>
  );
  const _renderReplyBtn = () => (
    <View style={styles.replyBtnContainer}>
      <TextButton
        style={styles.cancelButton}
        onPress={_handleClosePress}
        text={intl.formatMessage({
          id: 'quick_reply.close',
        })}
      />
      <MainButton
        style={styles.commentBtn}
        onPress={() => _submitReply()}
        text={intl.formatMessage({
          id: 'quick_reply.reply',
        })}
        isLoading={isSending}
      />
    </View>
  );
  const _renderContent = () => {
    return (
      <View style={styles.modalContainer}>
        {_renderSummary()}
        {_renderAvatar()}
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
            style={styles.textInput}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.footer}>
          {_renderExpandBtn()}
          {_renderReplyBtn()}
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
      {selectedPost && _renderContent()}
    </ActionSheet>
  );
};

export default forwardRef(QuickReplyModal as any);
