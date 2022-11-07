import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { View, Text, Alert, TouchableOpacity, Keyboard, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { get } from 'lodash';
import { postBodySummary } from '@ecency/render-helper';
import styles from './quickReplyModalStyles';
import { IconButton, MainButton, TextButton, TextInput, UserAvatar } from '..';
import { delay, generateReplyPermlink } from '../../utils/editor';
import { postComment } from '../../providers/hive/dhive';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  deleteDraftCacheEntry,
  updateCommentCache,
  updateDraftCache,
} from '../../redux/actions/cacheActions';
import { default as ROUTES } from '../../constants/routeNames';
import RootNavigation from '../../navigation/rootNavigation';
import { Draft } from '../../redux/reducers/cacheReducer';
import { RootState } from '../../redux/store/store';

import { PointActivityIds } from '../../providers/ecency/ecency.types';
import { useUserActivityMutation } from '../../providers/queries/pointQueries';

export interface QuickReplyModalContentProps {
  selectedPost?: any;
  handleCloseRef?: any;
  onClose: () => void;
}

export const QuickReplyModalContent = forwardRef(
  ({ selectedPost, onClose }: QuickReplyModalContentProps, ref) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const userActivityMutation = useUserActivityMutation();

    const inputRef = useRef(null);

    const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
    const pinCode = useSelector((state: RootState) => state.application.pin);
    const drafts = useSelector((state: RootState) => state.cache.drafts);

    const [commentValue, setCommentValue] = useState('');
    const [isSending, setIsSending] = useState(false);

    const headerText =
      selectedPost && (selectedPost.summary || postBodySummary(selectedPost, 150, Platform.OS));
    const parentAuthor = selectedPost ? selectedPost.author : '';
    const parentPermlink = selectedPost ? selectedPost.permlink : '';
    const draftId = `${currentAccount.name}/${parentAuthor}/${parentPermlink}`; // different draftId for each user acount

    useImperativeHandle(ref, () => ({
      handleSheetClose() {
        _addQuickCommentIntoCache();
      },
    }));

    // load quick comment value from cache
    useEffect(() => {
      let _value = '';
      if (drafts.has(draftId) && currentAccount.name === drafts.get(draftId).author) {
        const quickComment: Draft = drafts.get(draftId);
        _value = quickComment.body;
      }

      if (inputRef.current) {
        inputRef.current.setNativeProps({
          text: _value,
        });
        setCommentValue(_value);
      }
    }, [selectedPost]);

    // add quick comment value into cache
    const _addQuickCommentIntoCache = (value = commentValue) => {
      const quickCommentDraftData: Draft = {
        author: currentAccount.name,
        body: value,
      };

      // add quick comment cache entry
      dispatch(updateDraftCache(draftId, quickCommentDraftData));
    };

    // handle close press
    const _handleClosePress = () => {
      onClose();
    };

    // navigate to post on summary press
    const _handleOnSummaryPress = () => {
      Keyboard.dismiss();
      onClose();
      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          content: selectedPost,
        },
        key: get(selectedPost, 'permlink'),
      });
    };

    // handle submit reply
    const _submitReply = async () => {
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
          .then((response) => {
            userActivityMutation.mutate({
              pointsTy: PointActivityIds.COMMENT,
              transactionId: response.id,
            });
            setIsSending(false);
            setCommentValue('');

            if (inputRef.current) {
              inputRef.current.setNativeProps({
                text: '',
              });
            }

            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.success',
                }),
              ),
            );

            // add comment cache entry
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

            // close should alwasy be called at method end
            onClose();
          })
          .catch((error) => {
            console.log(error);
            Alert.alert(
              intl.formatMessage({
                id: 'alert.fail',
              }),
              error.message || JSON.stringify(error),
            );

            setIsSending(false);
            _addQuickCommentIntoCache(); // add comment value into cache if there is error while posting comment
          });
        console.log('status : ', status);
      }
    };

    const _handleExpandBtn = async () => {
      if (selectedPost) {
        Keyboard.dismiss();
        onClose();
        await delay(50);
        RootNavigation.navigate({
          name: ROUTES.SCREENS.EDITOR,
          key: 'editor_replay',
          params: {
            isReply: true,
            post: selectedPost,
          },
        });
      }
    };

    // REMOVED FOR TESTING, CAN BE PUT BACK IF APP STILL CRASHES
    // const _deboucedCacheUpdate = useCallback(debounce(_addQuickCommentIntoCache, 500), [])

    const _onChangeText = (value) => {
      setCommentValue(value);
      // REMOVED FOR TESTING, CAN BE PUT BACK IF APP STILL CRASHES
      // _deboucedCacheUpdate(value)
    };

    // VIEW_RENDERERS

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
            innerRef={inputRef}
            onChangeText={_onChangeText}
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
    );

    return _renderContent;
  },
);
