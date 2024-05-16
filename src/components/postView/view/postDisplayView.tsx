import React, { useCallback, useEffect, useRef, useState, Fragment } from 'react';
import { View, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Providers
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
import { PostPlaceHolder, StickyBar, TextWithIcon, NoPost } from '../../basicUIElements';
import { IconButton } from '../../iconButton';
import { ParentPost } from '../../parentPost';

// Styles
import styles from './postDisplayStyles';
import { OptionsModal, WritePostButton } from '../../atoms';
import getWindowDimensions from '../../../utils/getWindowDimensions';
import { useAppDispatch } from '../../../hooks';
import { showProfileModal, showReplyModal } from '../../../redux/actions/uiAction';
import { PostTypes } from '../../../constants/postTypes';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { PostComments } from '../../postComments';
import { UpvoteButton } from '../../postCard/children/upvoteButton';
import UpvotePopover from '../../upvotePopover';
import { PostPoll } from '../../postPoll';
import { useQueryClient } from '@tanstack/react-query';
import QUERIES from '../../../providers/queries/queryKeys';

const WIDTH = getWindowDimensions().width;

const PostDisplayView = ({
  currentAccount,
  isLoggedIn,
  isNewPost,
  fetchPost,
  handleOnEditPress,
  handleOnVotersPress,
  handleOnReblogsPress,
  post,
  intl,
  parentPost,
  isPostUnavailable,
  author,
  permlink,
  handleOnRemovePress,
  activeVotes,
  isWavePost,
  activeVotesCount,
}) => {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const userActivityMutation = useUserActivityMutation();

  const postCommentsRef = useRef<PostComments>(null);
  const upvotePopoverRef = useRef<UpvotePopover>(null);

  const [cacheVoteIcrement] = useState(0);
  const [isLoadedComments, setIsLoadedComments] = useState(false);
  const actionSheet = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [postBodyLoading, setPostBodyLoading] = useState(true);
  const [tags, setTags] = useState([]);

  // Component Life Cycles
  useEffect(() => {
    if (isLoggedIn && get(currentAccount, 'name') && !isNewPost) {
      // track user activity for view post
      userActivityMutation.mutate({
        pointsTy: PointActivityIds.VIEW_POST,
      });
    }
  }, []);

  useEffect(() => {
    if (post) {
      const _tags = get(post.json_metadata, 'tags', []);
      if (post.category && _tags[0] !== post.category && Array.isArray(_tags)) {
        _tags.splice(0, 0, post.category);
      }
      setTags(_tags);
    }
  }, [post]);

  // Component Functions
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPost().then(() => setRefreshing(false));
    queryClient.resetQueries([QUERIES.POST.GET_POLL, author, permlink]);
  }, [refreshing]);

  const _scrollToComments = () => {
    if (postCommentsRef.current) {
      postCommentsRef.current.scrollToComments();
    }
  };

  const _handleOnReblogsPress = () => {
    if (post.reblogs > 0 && handleOnReblogsPress) {
      handleOnReblogsPress();
    }
  };

  const _onUpvotePress = ({
    anchorRect,
    content,
    onVotingStart,
    showPayoutDetails = false,
    postType = isWavePost ? PostTypes.WAVE : parentPost ? PostTypes.COMMENT : PostTypes.POST,
  }: any) => {
    if (upvotePopoverRef.current) {
      upvotePopoverRef.current.showPopover({
        anchorRect,
        content,
        showPayoutDetails,
        postType,
        onVotingStart,
      });
    }
  };

  const _renderActionPanel = (isFixedFooter = false) => {
    return (
      <StickyBar isFixedFooter={isFixedFooter} style={styles.stickyBar}>
        <View style={[styles.stickyWrapper, { paddingBottom: insets.bottom ? insets.bottom : 8 }]}>
          <UpvoteButton
            activeVotes={activeVotes}
            isShowPayoutValue={true}
            content={post}
            parentType={parentPost ? PostTypes.COMMENT : PostTypes.POST}
            boldPayout={true}
            onUpvotePress={(anchorRect, onVotingStart) => {
              _onUpvotePress({ anchorRect, content: post, onVotingStart });
            }}
            onPayoutDetailsPress={(anchorRect) => {
              _onUpvotePress({ anchorRect, content: post, showPayoutDetails: true });
            }}
          />
          <TextWithIcon
            iconName="heart-outline"
            iconStyle={styles.barIcons}
            iconType="MaterialCommunityIcons"
            isClickable
            onPress={() => handleOnVotersPress && handleOnVotersPress()}
            text={activeVotesCount + cacheVoteIcrement}
            textMarginLeft={20}
          />
          <TextWithIcon
            iconName="repeat"
            iconStyle={styles.barIcons}
            iconType="MaterialIcons"
            isClickable
            onPress={_handleOnReblogsPress}
            text={post.reblogs || ''}
            textMarginLeft={20}
          />
          {isLoggedIn && (
            <TextWithIcon
              iconName="comment-outline"
              iconStyle={styles.barIcons}
              iconType="MaterialCommunityIcons"
              isClickable
              text={get(post, 'children', 0)}
              textMarginLeft={20}
              onLongPress={_showQuickReplyModal}
              onPress={() => _scrollToComments()}
              isLoading={!isLoadedComments}
            />
          )}
          {!isLoggedIn && (
            <TextWithIcon
              iconName="comment-outline"
              iconStyle={styles.barIcons}
              iconType="MaterialCommunityIcons"
              isClickable
              text={get(post, 'children', 0)}
              textMarginLeft={20}
            />
          )}
          <View style={styles.stickyRightWrapper}>
            {get(currentAccount, 'name') === get(post, 'author') && (
              <Fragment>
                {!get(post, 'children') && !activeVotes.length && (
                  <IconButton
                    iconStyle={styles.barIconRight}
                    iconType="MaterialIcons"
                    name="delete-forever"
                    onPress={() => actionSheet.current.show()}
                    style={styles.barIconButton}
                  />
                )}
                <IconButton
                  iconStyle={styles.barIconRight}
                  iconType="MaterialIcons"
                  name="create"
                  onPress={() => handleOnEditPress && handleOnEditPress()}
                  style={styles.barIconButton}
                />
              </Fragment>
            )}
          </View>
        </View>
      </StickyBar>
    );
  };

  const { name } = currentAccount;

  const formatedTime = post && getTimeFromNow(post.created);

  const capitalize = (appname) => appname && appname[0].toUpperCase() + appname.slice(1);

  if (isPostUnavailable) {
    return (
      <NoPost
        imageStyle={styles.noPostImage}
        defaultText={`${intl.formatMessage({
          id: 'post.removed_hint',
        })}`}
      />
    );
  }

  const _handleOnPostBodyLoad = () => {
    setPostBodyLoading(false);
  };

  // show quick reply modal
  const _showQuickReplyModal = (_post = post) => {
    if (isLoggedIn) {
      dispatch(showReplyModal({ mode: 'comment', parentPost: _post }));
    } else {
      console.log('Not LoggedIn');
    }
  };

  // show quick reply modal
  const _showQuickProfileModal = (username) => {
    if (username) {
      dispatch(showProfileModal(username));
    }
  };

  const _handleOnCommentsLoaded = () => {
    setIsLoadedComments(true);
  };

  const _postContentView = (
    <>
      {parentPost && <ParentPost post={parentPost} />}

      <View style={styles.header}>
        {!post ? (
          <PostPlaceHolder />
        ) : (
          <View
            onLayout={(event) => {
              console.log('content view height', event.nativeEvent.layout.height);
            }}
          >
            {!!post.title && !post.depth ? (
              <Text style={styles.title}>{post.title}</Text>
            ) : (
              <View style={styles.titlePlaceholder} />
            )}

            <PostHeaderDescription
              date={formatedTime}
              name={author || post.author}
              currentAccountUsername={name}
              reputation={post.author_reputation}
              size={40}
              inlineTime={true}
              customStyle={styles.headerLine}
              profileOnPress={_showQuickProfileModal}
            />
            <PostBody
              body={post.body}
              metadata={post.json_metadata}
              onLoadEnd={_handleOnPostBodyLoad}
            />
            
            <PostPoll 
              author={author} 
              permlink={permlink} 
              metadata={post.json_metadata}  />

            {!postBodyLoading && (
              <View style={styles.footer}>
                <Tags tags={tags} />
                <Text style={styles.footerText}>
                  {intl.formatMessage(
                    { id: 'post.posted_by' },
                    {
                      username: author || post.author,
                      appname: post?.json_metadata?.app
                        ? capitalize((post?.json_metadata?.app).split('/')[0])
                        : 'Ecency',
                    },
                  )}
                  {formatedTime}
                </Text>
                <WritePostButton
                  placeholderId="quick_reply.placeholder"
                  onPress={_showQuickReplyModal}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.scroll, styles.scrollContent, { width: WIDTH }]}>
        <PostComments
          ref={postCommentsRef}
          author={author || post?.author}
          mainAuthor={author || post?.author}
          permlink={permlink || post?.permlink}
          commentCount={post?.children}
          fetchPost={fetchPost}
          handleOnVotersPress={handleOnVotersPress}
          handleOnReplyPress={_showQuickReplyModal}
          handleOnCommentsLoaded={_handleOnCommentsLoaded}
          fetchedAt={post?.post_fetched_at}
          isPostLoading={postBodyLoading}
          postContentView={_postContentView}
          onRefresh={onRefresh}
          refreshing={refreshing}
          setRefreshing={setRefreshing}
          onUpvotePress={_onUpvotePress}
        />
      </View>
      {post && _renderActionPanel(true)}

      <OptionsModal
        ref={actionSheet}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_alert' })}
        cancelButtonIndex={1}
        onPress={(index) => (index === 0 ? handleOnRemovePress(get(post, 'permlink')) : null)}
      />
      <UpvotePopover ref={upvotePopoverRef} />
    </View>
  );
};

export default injectIntl(PostDisplayView);
