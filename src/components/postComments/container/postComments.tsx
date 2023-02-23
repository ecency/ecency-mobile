import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useMemo,
  useEffect,
  Fragment,
} from 'react';
import { ActivityIndicator, Alert, Modal, PermissionsAndroid, Platform, RefreshControl, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import ActionsSheet from 'react-native-actions-sheet';
import ImageViewer from 'react-native-image-zoom-viewer';

// Components
import { postBodySummary } from '@ecency/render-helper';
import EStyleSheet from 'react-native-extended-stylesheet';
import COMMENT_FILTER, { VALUE } from '../../../constants/options/comment';
import { FilterBar } from '../../filterBar';
import { postQueries } from '../../../providers/queries';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import { showActionModal, showProfileModal, toastNotification } from '../../../redux/actions/uiAction';
import { writeToClipboard } from '../../../utils/clipboard';
import { deleteComment } from '../../../providers/hive/dhive';
import { updateCommentCache } from '../../../redux/actions/cacheActions';
import { CacheStatus } from '../../../redux/reducers/cacheReducer';
import { CommentsSection } from '../children/commentsSection';
import styles from '../children/postComments.styles';
import { PostTypes } from '../../../constants/postTypes';
import CameraRoll from '@react-native-community/cameraroll';
import RNFetchBlob from 'rn-fetch-blob';
import { OptionsModal } from '../../atoms';
import VideoPlayer from '../../videoPlayer/videoPlayerView';


const PostComments = forwardRef(
  (
    {
      author,
      permlink,
      mainAuthor,
      postContentView,
      isLoading,
      onRefresh,
      handleOnCommentsLoaded,
      handleOnReplyPress,
      onUpvotePress
    },
    ref,
  ) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const navigation = useNavigation();

    const currentAccount = useAppSelector((state) => state.account.currentAccount);
    const pinHash = useAppSelector((state) => state.application.pin);
    const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);

    const discussionQuery = postQueries.useDiscussionQuery(author, permlink);
    const postsCachePrimer = postQueries.usePostsCachePrimer();

    const writeCommentRef = useRef(null);
    const commentsListRef = useRef<FlatList | null>(null);
    const actionImage = useRef(null);
    const actionLink = useRef(null);
    const youtubePlayerRef = useRef(null);

    const [postImages, setPostImages] = useState<string[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('trending');
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(0);
    const [shouldRenderComments, setShouldRenderComments] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [videoUrl, setVideoUrl] = useState(null);
    const [youtubeVideoId, setYoutubeVideoId] = useState(null);
    const [videoStartTime, setVideoStartTime] = useState(0);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedLink, setSelectedLink] = useState(null);

    const sortedSections = useMemo(
      () => _sortComments(selectedFilter, discussionQuery.sectionedData),
      [discussionQuery.sectionedData, selectedFilter],
    );

    useImperativeHandle(ref, () => ({
      bounceCommentButton: () => {
        console.log('bouncing comment button');
        if (writeCommentRef.current) {
          writeCommentRef.current.bounce();
        }
      },
      scrollToComments: () => {
        if (commentsListRef.current && (!sortedSections.length || !shouldRenderComments)) {
          commentsListRef.current.scrollToOffset({ offset: headerHeight + 200 });
        } else if (commentsListRef.current && sortedSections.length) {
          commentsListRef.current.scrollToIndex({ index: 0, viewOffset: 108 });
        }
      },
    }));

    useEffect(() => {
      if (!discussionQuery.isLoading) {
        handleOnCommentsLoaded();
      }
    }, [discussionQuery.isLoading]);

    const _onRefresh = () => {
      discussionQuery.refetch();
      onRefresh();
    };

    const checkAndroidPermission = async () => {
      try {
        const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;
        await PermissionsAndroid.request(permission);
        Promise.resolve();
      } catch (error) {
        Promise.reject(error);
      }
    };

    const _downloadImage = async (uri) => {
      return RNFetchBlob.config({
        fileCache: true,
        appendExt: 'jpg',
      })
        .fetch('GET', uri)
        .then((res) => {
          const { status } = res.info();

          if (status == 200) {
            return res.path();
          } else {
            Promise.reject();
          }
        })
        .catch((errorMessage) => {
          Promise.reject(errorMessage);
        });
    };

    const _saveImage = async (uri) => {
      try {
        if (Platform.OS === 'android') {
          await checkAndroidPermission();
          uri = `file://${await _downloadImage(uri)}`;
        }
        CameraRoll.saveToCameraRoll(uri)
          .then(() => {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'post.image_saved',
                }),
              ),
            );
          })
          .catch(() => {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'post.image_saved_error',
                }),
              ),
            );
          });
      } catch (error) {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'post.image_saved_error',
            }),
          ),
        );
      }
    };

    const _handleYoutubePress = (videoId, startTime) => {
      if (videoId && youtubePlayerRef.current) {
        setYoutubeVideoId(videoId);
        setVideoStartTime(startTime);
        youtubePlayerRef.current.setModalVisible(true);
      }
    };

    const _handleVideoPress = (embedUrl) => {
      if (embedUrl && youtubePlayerRef.current) {
        setVideoUrl(embedUrl);
        setVideoStartTime(0);
        youtubePlayerRef.current.setModalVisible(true);
      }
    };


    const _handleOnDropdownSelect = (option, index) => {
      setSelectedFilter(option);
      setSelectedOptionIndex(index);
    };

    const _handleOnVotersPress = (activeVotes, content) => {
      navigation.navigate({
        name: ROUTES.SCREENS.VOTERS,
        params: {
          activeVotes,
          content,
        },
        key: content.permlink,
      } as never);
    };

    const _handleOnEditPress = (item) => {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_edit_reply_${item.permlink}`,
        params: {
          isEdit: true,
          isReply: true,
          post: item,
        },
      } as never);
    };

    const _handleDeleteComment = (_permlink) => {

      const _onConfirmDelete = async () => {
        try {
          await deleteComment(currentAccount, pinHash, _permlink);
             // remove cached entry based on parent
             const _commentPath = `${currentAccount.username}/${_permlink}`;
             console.log('deleted comment', _commentPath);
     
             const _deletedItem = discussionQuery.data[_commentPath];
             if (_deletedItem) {
               _deletedItem.status = CacheStatus.DELETED;
               delete _deletedItem.updated;
               dispatch(updateCommentCache(_commentPath, _deletedItem, { isUpdate: true }));
             }
        } catch(err){
          console.warn('Failed to delete comment')
        }
        
      }

      dispatch(showActionModal({
        title:intl.formatMessage({id:'delete.confirm_delete_title'}),
        buttons:[{
          text: intl.formatMessage({ id: 'alert.cancel' }),
          onPress:()=>{console.log("canceled delete comment")}
        },{
          text:intl.formatMessage({ id: 'alert.delete' }),
          onPress:_onConfirmDelete
        }]
      }))


    };

    const _openReplyThread = (comment) => {
      postsCachePrimer.cachePost(comment);
      navigation.navigate({
        name: ROUTES.SCREENS.POST,
        key: comment.permlink,
        params: {
          author: comment.author,
          permlink: comment.permlink,
        },
      } as never);
    };

    const _handleOnUserPress = (username) => {
      dispatch(showProfileModal(username));
    }

    const _handleShowOptionsMenu = (comment) => {
      const _showCopiedToast = () => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.copied',
            }),
          ),
        );
      };

      const _copyCommentLink = () =>
        writeToClipboard(`https://ecency.com${comment.url}`).then(_showCopiedToast);

      const _copyCommentBody = () => {
        const body = postBodySummary(comment.markdownBody, undefined, Platform.OS);
        writeToClipboard(body).then(_showCopiedToast);
      };

      const _openThread = () => _openReplyThread(comment);

      dispatch(
        showActionModal({
          title: intl.formatMessage({ id: 'post.select_action' }),
          buttons: [
            {
              text: intl.formatMessage({ id: 'post.copy_link' }),
              onPress: _copyCommentLink,
            },
            {
              text: intl.formatMessage({ id: 'post.copy_text' }),
              onPress: _copyCommentBody,
            },
            {
              text: intl.formatMessage({ id: 'post.open_thread' }),
              onPress: _openThread,
            },
          ],
        }),
      );
    };



    const _handleImageOptionPress = (ind) => {
      if (ind === 1) {
        // open gallery mode
        setIsImageModalOpen(true);
      }
      if (ind === 0) {
        // copy to clipboard
        writeToClipboard(selectedImage).then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
        });
      }
      if (ind === 2) {
        // save to local
        _saveImage(selectedImage);
      }

      setSelectedImage(null);
    };

    const _handleLinkOptionPress = (ind) => {
      if (ind === 1) {
        // open link
        if (selectedLink) {
          navigation.navigate({
            name: ROUTES.SCREENS.WEB_BROWSER,
            params: {
              url: selectedLink,
            },
            key: selectedLink,
          } as never);
        }
      }
      if (ind === 0) {
        // copy to clipboard
        writeToClipboard(selectedLink).then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
        });
      }

      setSelectedLink(null);
    };



    const _handleLinkPress = (url:string) => {
     
      setSelectedLink(url);
      actionLink.current?.show();
    }

    const _handleImagePress = (url: string, postImgUrls: string[]) => {
      setPostImages(postImgUrls);
      setSelectedImage(url);
      actionImage.current?.show();
    }


    const _onContentSizeChange = (x: number, y: number) => {
      // lazy render comments after post is rendered;
      if (!shouldRenderComments) {
        setHeaderHeight(y);
        setShouldRenderComments(true);
      }
    };



    const _postContentView = (
      <>
        {postContentView && postContentView}
        {!isLoading && (
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={VALUE.map((val) => intl.formatMessage({ id: `comment_filter.${val}` }))}
            defaultText={intl.formatMessage({ id: `comment_filter.${VALUE[0]}` })}
            onDropdownSelect={(selectedIndex) =>
              _handleOnDropdownSelect(COMMENT_FILTER[selectedIndex], selectedIndex)
            }
            selectedOptionIndex={selectedOptionIndex}
          />
        )}
      </>
    );

    const _renderEmptyContent = () => {
      if (discussionQuery.isLoading || !!sortedSections.length) {
        return (
          <ActivityIndicator style={{ marginTop: 16 }} color={EStyleSheet.value('$primaryBlack')} />
        );
      }
      const _onPress = () => {
        if (handleOnReplyPress) {
          handleOnReplyPress();
        }
      };
      return (
        <Text onPress={_onPress} style={styles.emptyText}>
          {intl.formatMessage({ id: 'comments.no_comments' })}
        </Text>
      );
    };

    const _renderItem = ({ item, index }) => {
      return (
        <CommentsSection
          item={item}
          index={index}
          mainAuthor={mainAuthor}
          handleDeleteComment={_handleDeleteComment}
          handleOnEditPress={_handleOnEditPress}
          handleOnVotersPress={_handleOnVotersPress}
          handleOnLongPress={_handleShowOptionsMenu}
          handleOnUserPress={_handleOnUserPress}
          handleImagePress={_handleImagePress}
          handleLinkPress={_handleLinkPress}
          handleVideoPress={_handleVideoPress}
          handleYoutubePress={_handleYoutubePress}
          openReplyThread={_openReplyThread}
          onUpvotePress={(anchorRect, showPayoutDetails) => onUpvotePress({ anchorRect, showPayoutDetails, content: item, postType: PostTypes.COMMENT })}
        />
      )
    }



    return (
      <Fragment>
        <FlatList
          ref={commentsListRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={_postContentView}
          ListEmptyComponent={_renderEmptyContent}
          data={shouldRenderComments ? sortedSections : []}
          onContentSizeChange={_onContentSizeChange}
          renderItem={_renderItem}
          keyExtractor={(item) => `${item.author}/${item.permlink}`}
          refreshControl={
            <RefreshControl
              refreshing={discussionQuery.isFetching}
              onRefresh={_onRefresh}
              progressBackgroundColor="#357CE6"
              tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
              titleColor="#fff"
              colors={['#fff']}
            />
          }
        />


        <Modal visible={isImageModalOpen} transparent={true}>
          <ImageViewer
            imageUrls={postImages.map((url) => ({ url }))}
            enableSwipeDown
            onCancel={() => setIsImageModalOpen(false)}
            onClick={() => setIsImageModalOpen(false)}
          />
        </Modal>


        <OptionsModal
          ref={actionImage}
          options={[
            intl.formatMessage({ id: 'post.copy_link' }),
            intl.formatMessage({ id: 'post.gallery_mode' }),
            intl.formatMessage({ id: 'post.save_to_local' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'post.image' })}
          cancelButtonIndex={3}
          onPress={(index) => {
            _handleImageOptionPress(index);
          }}
        />


        <OptionsModal
          ref={actionLink}
          options={[
            intl.formatMessage({ id: 'post.copy_link' }),
            intl.formatMessage({ id: 'alert.external_link' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'post.link' })}
          cancelButtonIndex={2}
          onPress={(index) => {
            _handleLinkOptionPress(index);
          }}
        />

        <ActionsSheet
          ref={youtubePlayerRef}
          gestureEnabled={true}
          hideUnderlay={true}
          containerStyle={{ backgroundColor: 'black' }}
          indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
          onClose={() => {
            setYoutubeVideoId(null);
            setVideoUrl(null);
          }}
        >
          <VideoPlayer
            mode={youtubeVideoId ? 'youtube' : 'uri'}
            youtubeVideoId={youtubeVideoId}
            uri={videoUrl}
            startTime={videoStartTime}
          />
        </ActionsSheet>

      </Fragment>

    );
  },
);

export default PostComments;

const _sortComments = (sortOrder = 'trending', _comments) => {
  const sortedComments: any[] = _comments;

  const absNegative = (a) => a.net_rshares < 0;

  const sortOrders = {
    trending: (a, b) => {
      if (a.renderOnTop) {
        return -1;
      }

      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const apayout = a.total_payout;
      const bpayout = b.total_payout;

      if (apayout !== bpayout) {
        return bpayout - apayout;
      }

      return 0;
    },
    reputation: (a, b) => {
      if (a.renderOnTop) {
        return -1;
      }

      const keyA = a.author_reputation;
      const keyB = b.author_reputation;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    votes: (a, b) => {
      if (a.renderOnTop) {
        return -1;
      }

      const keyA = a.active_votes.length;
      const keyB = b.active_votes.length;

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
    age: (a, b) => {
      if (a.renderOnTop) {
        return -1;
      }

      if (absNegative(a)) {
        return 1;
      }

      if (absNegative(b)) {
        return -1;
      }

      const keyA = Date.parse(a.created);
      const keyB = Date.parse(b.created);

      if (keyA > keyB) {
        return -1;
      }
      if (keyA < keyB) {
        return 1;
      }

      return 0;
    },
  };

  sortedComments.sort(sortOrders[sortOrder]);

  return sortedComments;
};
