import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  Fragment,
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
import { Icon, IconButton, MainButton, TextButton, TextInput, UploadsGalleryModal, UserAvatar } from '..';
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
import { MediaInsertData, MediaInsertStatus } from '../uploadsGalleryModal/container/uploadsGalleryModal';
import FastImage from 'react-native-fast-image';

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

    const uploadsGalleryModalRef = useRef(null);


    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const postSubmitter = usePostSubmitter();

    // const inputRef = useRef<RNTextInput | null>(null);

    const currentAccount = useSelector((state: RootState) => state.account.currentAccount);
    const draftsCollection = useSelector((state: RootState) => state.cache.draftsCollection);

    const [commentValue, setCommentValue] = useState('');
    const [mediaUrls, setMediaUrls] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [mediaModalVisible, setMediaModalVisible] = useState(true);

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
      let _body = mediaUrls.length > 0 ? commentValue + `\n\n ![Wave Media](${mediaUrls[0]})` : commentValue;

      switch (mode) {
        case 'comment':
          _isSuccess = await postSubmitter.submitReply(_body, selectedPost);
          break;;
        case 'wave':
          _isSuccess = await postSubmitter.submitWave(_body);
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



    const _handleMediaInsert = (data: MediaInsertData[]) => {
      const _insertUrls: string[] = []
      data.forEach((item) => {
        if (item.url && item.status === MediaInsertStatus.READY) {
          _insertUrls.push(item.url)
        }
      })

      setMediaUrls(_insertUrls);
      setMediaModalVisible(false);
      uploadsGalleryModalRef.current?.toggleModal(false);

    }



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
      if (uploadsGalleryModalRef.current) {
        uploadsGalleryModalRef.current.toggleModal(!mediaModalVisible)
        setMediaModalVisible(!mediaModalVisible)
      }
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


    const _renderMediaPanel = () => {
      const _onPress = () => {
        setMediaUrls([])
      }

      const _minusIcon = (
        !isUploading &&
        <View style={styles.minusContainer}>
          <Icon
            color={EStyleSheet.value('$pureWhite')}
            iconType="MaterialCommunityIcons"
            name="minus"
            size={16}
          />
        </View>
      )


      const _mediaThumb = (
        !mediaModalVisible && mediaUrls.length > 0 && (
          <TouchableOpacity onPress={_onPress} disabled={isUploading}>
            <FastImage
              source={{ uri: mediaUrls[0] }}
              style={styles.mediaItem}
            />
            {_minusIcon}
          </TouchableOpacity>
        )
      )

      return <Fragment>
        {_mediaThumb}

        <UploadsGalleryModal
          ref={uploadsGalleryModalRef}
          insertedMediaUrls={mediaUrls}
          isPreviewActive={false}
          paramFiles={null}
          isEditing={false}
          username={currentAccount.username}
          hideToolbarExtension={() => { }}
          handleMediaInsert={_handleMediaInsert}
          setIsUploading={setIsUploading}
        />
      </Fragment>
    }


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
            isDisable={isUploading}
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

        {_renderMediaPanel()}




        <View style={styles.footer}>
          {_renderExpandBtn()}
          {_renderReplyBtn()}
        </View>
      </View>
    )
  },
);
