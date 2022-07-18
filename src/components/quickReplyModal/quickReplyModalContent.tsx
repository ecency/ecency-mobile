import React, { useEffect, useState, useCallback } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './quickReplyModalStyles';
import { View, Text, Alert, TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView } from 'react-native';
import { useIntl } from 'react-intl';
import { IconButton, MainButton, TextButton, TextInput, UserAvatar } from '..';
import { useSelector, useDispatch } from 'react-redux';
import { delay, generateReplyPermlink } from '../../utils/editor';
import { postComment } from '../../providers/hive/dhive';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  deleteDraftCacheEntry,
  updateCommentCache,
  updateDraftCache,
} from '../../redux/actions/cacheActions';
import { default as ROUTES } from '../../constants/routeNames';
import { get, debounce } from 'lodash';
import { navigate } from '../../navigation/service';
import { postBodySummary } from '@ecency/render-helper';
import { Draft } from '../../redux/reducers/cacheReducer';
import { RootState } from '../../redux/store/store';

export interface QuickReplyModalContentProps {
  fetchPost?: any;
  selectedPost?: any;
  inputRef?: any;
  handleCloseRef?: any;
  onClose:()=>void;
}

export const QuickReplyModalContent = ({
  selectedPost,
  handleCloseRef,
  onClose,
}: QuickReplyModalContentProps) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
  const pinCode = useSelector((state: RootState) => state.application.pin);
  const drafts = useSelector((state: RootState) => state.cache.drafts);

  const [commentValue, setCommentValue] = useState('');
  const [isSending, setIsSending] = useState(false);


  const headerText =
    selectedPost && (selectedPost.summary || postBodySummary(selectedPost, 150, Platform.OS as any));
  let parentAuthor = selectedPost ? selectedPost.author : '';
  let parentPermlink = selectedPost ? selectedPost.permlink : '';
  let draftId = `${currentAccount.name}/${parentAuthor}/${parentPermlink}`; //different draftId for each user acount


  useEffect(() => {
    handleCloseRef.current = handleSheetClose;
  }, [commentValue]);

  // load quick comment value from cache
  useEffect(() => {
    if (drafts.has(draftId) && currentAccount.name === drafts.get(draftId).author) {
      const quickComment: Draft = drafts.get(draftId);
      setCommentValue(quickComment.body);
    } else {
      setCommentValue('');
    }
  }, [selectedPost]);

  // handlers

  const handleSheetClose = () => {
    _addQuickCommentIntoCache();
  };

  // add quick comment value into cache
  const _addQuickCommentIntoCache = (value = commentValue) => {

    const quickCommentDraftData: Draft = {
      author: currentAccount.name,
      body: value
    };

    //add quick comment cache entry
    dispatch(updateDraftCache(draftId, quickCommentDraftData));
  };


  // handle close press
  const _handleClosePress = () => {
    onClose()
  };


  // navigate to post on summary press
  const _handleOnSummaryPress = () => {
    Keyboard.dismiss();
    onClose();
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
            onClose();
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
            // delete quick comment draft cache if it exist
            if (drafts.has(draftId)) {
              dispatch(deleteDraftCacheEntry(draftId));
            }
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
            _addQuickCommentIntoCache(); //add comment value into cache if there is error while posting comment
            clearTimeout(stateTimer);
          }, 500);
        });
      console.log('status : ', status);
    }
  };

  const _handleExpandBtn = async () => {
    if (selectedPost) {
      Keyboard.dismiss();
      onClose();
      await delay(50);
      navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        key: 'editor_replay',
        params: {
          isReply: true,
          post: selectedPost,
        },
      });
    }
  };


  const _deboucedCacheUpdate = useCallback(debounce(_addQuickCommentIntoCache, 500), [])

  const _onChangeText = (value) => {
    setCommentValue(value);
    _deboucedCacheUpdate(value)
  }



  //VIEW_RENDERERS


  const _renderSummary = () => (
    <TouchableOpacity onPress={() => _handleOnSummaryPress()}>
      <Text numberOfLines={2} style={styles.summaryStyle}>
        {headerText}
      </Text>
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



  const _renderContent = (
    <View style={styles.modalContainer}>
      {_renderSummary()}
      {_renderAvatar()}
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={_onChangeText}
          value={commentValue}
          autoFocus
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
  )

  return _renderContent
};
