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
  TouchableOpacity,
  Keyboard,
  Platform,
  Alert,
} from 'react-native';
import { useIntl } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { get, debounce } from 'lodash';
import { postBodySummary } from '@ecency/render-helper';
import styles from './quickReplyModalStyles';
import { IconButton, MainButton, TextButton, TextInput, UploadsGalleryModal, UserAvatar } from '..';
import { delay } from '../../utils/editor';
import {
  deleteDraftCacheEntry,
  updateDraftCache,
} from '../../redux/actions/cacheActions';
import { default as ROUTES } from '../../constants/routeNames';
import RootNavigation from '../../navigation/rootNavigation';
import { Draft } from '../../redux/reducers/cacheReducer';
import { RootState } from '../../redux/store/store';

import { postQueries } from '../../providers/queries';
import { usePostSubmitter } from './usePostSubmitter';

export interface QuickReplyModalContentProps {
  mode: 'comment' | 'wave' | 'post',
  selectedPost?: any;
  handleCloseRef?: any;
  onClose: () => void;
}

export const QuickReplyModalContent = forwardRef(
  ({
    mode,
    selectedPost,
    onClose
  }: QuickReplyModalContentProps, ref) => {
    const intl = useIntl();
    const dispatch = useDispatch();
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const postSubmitter = usePostSubmitter();

    // const inputRef = useRef<RNTextInput | null>(null);

    const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
    const draftsCollection = useSelector((state: RootState) => state.cache.draftsCollection);

    const [commentValue, setCommentValue] = useState('');
    const [mediaUrl, setMediaUrl] = useState('');

    const headerText =
      selectedPost && (selectedPost.summary || postBodySummary(selectedPost, 150, Platform.OS));
    const parentAuthor = selectedPost ? selectedPost.author : '';
    const parentPermlink = selectedPost ? selectedPost.permlink : '';


    const draftId = mode === 'wave'
      ? `${currentAccount.name}/ecency.waves` //TODO: update author based on selected host
      : `${currentAccount.name}/${parentAuthor}/${parentPermlink}`; // different draftId for each user acount

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
    const _submitPost = async () => {

      let _isSuccess = false;

      //TODO: insert image url at the of comment wiht markdown format

      switch (mode) {
        case 'comment':
          _isSuccess = await postSubmitter.submitReply(commentValue, selectedPost);
          break;;
        case 'wave':
          _isSuccess = await postSubmitter.submitWave(commentValue);
          break;
        default:
          throw new Error("mode needs implementing")
      }


      if (_isSuccess) {

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

    const _handleMediaBtn = () => {
      Alert.alert("show media selection modal");
    }

    const _deboucedCacheUpdate = useCallback(debounce(_addQuickCommentIntoCache, 500), []);

    const _onChangeText = (value) => {
      setCommentValue(value);
      _deboucedCacheUpdate(value);
    };




    // VIEW_RENDERERS

    const _renderSummary = () => mode !== 'wave' && (
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
            iconType="MaterialsIcons"
            name="image-outline"
            onPress={_handleMediaBtn}
            size={24}
            color={EStyleSheet.value('$primaryBlack')}
          />
        {mode !== 'wave' && (
          <IconButton
            iconStyle={styles.backIcon}
            iconType="MaterialCommunityIcons"
            name="arrow-expand"
            onPress={_handleExpandBtn}
            size={28}
            color={EStyleSheet.value('$primaryBlack')}
          />
        )}

      </View>
    );



    const _renderReplyBtn = () => {
      const _titleId = mode !== 'comment' ? 'quick_reply.publish' : 'quick_reply.reply';
      return (
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
            onPress={() => _submitPost()}
            text={intl.formatMessage({
              id: _titleId,
            })}
            isLoading={postSubmitter.isSending}
          />
        </View>
      )

    };



    const _placeholderId = mode === 'comment' ? 'quick_reply.placeholder' : 'quick_reply.placeholder_wave'

    return (
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
              id: _placeholderId,
            })}
            placeholderTextColor="#c1c5c7"
            style={styles.textInput}
            multiline={true}
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

            {
              //TODO: link galley
      //   <UploadsGalleryModal
      //   ref={uploadsGalleryModalRef}
      //   insertedMediaUrls={insertedMediaUrls}
      //   isPreviewActive={isPreviewActive}
      //   paramFiles={paramFiles}
      //   isEditing={isEditing}
      //   username={currentAccount.username}
      //   hideToolbarExtension={_hideExtension}
      //   handleMediaInsert={handleMediaInsert}
      //   setIsUploading={setIsUploading}
      // />
            }

        <View style={styles.footer}>
          {_renderExpandBtn()}
          {_renderReplyBtn()}
        </View>
      </View>
    )
  },
);
