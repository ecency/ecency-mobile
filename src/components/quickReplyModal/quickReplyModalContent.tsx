import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  Keyboard,
  Platform,
  TextInput as RNTextInput,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { get, debounce } from 'lodash';
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
import { postQueries } from '../../providers/queries';
import { usePostSubmitter } from './usePostSubmitter';

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
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const postSubmitter = usePostSubmitter();

    // const inputRef = useRef<RNTextInput | null>(null);

    const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
    const pinCode = useSelector((state: RootState) => state.application.pin);
    const draftsCollection = useSelector((state: RootState) => state.cache.draftsCollection);

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
      if (
        draftsCollection &&
        !!draftsCollection[draftId] &&
        currentAccount.name === draftsCollection[draftId].author
      ) {
        const quickComment: Draft = draftsCollection[draftId];
        _value =
          currentAccount.name === quickComment.author && !!quickComment.body
            ? quickComment.body
            : '';
      }

      setCommentValue(_value);

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
      postsCachePrimer.cachePost(selectedPost);
      RootNavigation.navigate({
        name: ROUTES.SCREENS.POST,
        params: {
          author: selectedPost.author,
          permlink: selectedPost.permlink,
        },
        key: get(selectedPost, 'permlink'),
      });
    };




    // handle submit reply
    const _submitReply = async () => {

      const isSuccess = await postSubmitter.submitReply(commentValue, selectedPost)

      if(isSuccess){     
        
        // delete quick comment draft cache if it exist
        if (draftsCollection && draftsCollection[draftId]) {
          dispatch(deleteDraftCacheEntry(draftId));
        }
        setCommentValue('');
        onClose();
      } else {
        _addQuickCommentIntoCache(); // add comment value into cache if there is error while posting comment
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

    const _deboucedCacheUpdate = useCallback(debounce(_addQuickCommentIntoCache, 500), []);

    const _onChangeText = (value) => {
      setCommentValue(value);
      _deboucedCacheUpdate(value);
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
          isLoading={postSubmitter.isSending}
        />
      </View>
    );



    const _renderContent = (
      <View style={styles.modalContainer}>
        {_renderSummary()}
        {_renderAvatar()}
        <View style={styles.inputContainer}>
          <TextInput
            // innerRef={inputRef}
            value={commentValue}
            onChangeText={_onChangeText}
            autoFocus={true}
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
