import React, { Fragment, useState, useRef, useEffect, useMemo } from 'react';
import { Alert, View } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { View as AnimatedView } from 'react-native-animatable';

import { useDispatch } from 'react-redux';
import { getTimeFromNow } from '../../../utils/time';
// Constants

// Components
import { CommentBody, PostHeaderDescription } from '../../postElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { Comments } from '../../comments';
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from './commentStyles';
import { useAppSelector } from '../../../hooks';
import { OptionsModal } from '../../atoms';
import { showReplyModal } from '../../../redux/actions/uiAction';
import postTypes from '../../../constants/postTypes';
import EStyleSheet from 'react-native-extended-stylesheet';

const CommentView = ({
  avatarSize,
  comment,
  currentAccountUsername,
  commentNumber,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnLongPress,
  handleOnUserPress,
  handleOnVotersPress,
  isShowComments,
  mainAuthor = { mainAuthor },
  isShowSubComments,
  hideManyCommentsButton,
  openReplyThread,
  fetchedAt,
  incrementRepliesCount,
  handleOnToggleReplies
}) => {


  const intl = useIntl();
  const dispatch = useDispatch();
  const actionSheet = useRef(null);
  const repliesContainerRef = useRef<AnimatedView>(null);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isLoggedIn = useAppSelector((state)=>state.application.isLoggedIn);
  const isHideImage = useAppSelector((state)=>state.application.hidePostsThumbnails);
  const lastCacheUpdate = useAppSelector((state) => state.cache.lastUpdate);
  const cachedComments = useAppSelector((state) => state.cache.comments);

  const isMuted = useMemo(()=>currentAccount.mutes?.indexOf(comment.author) > -1, [currentAccount]);

  const [_isShowSubComments, setIsShowSubComments] = useState(false);
  const [isPressedShowButton, setIsPressedShowButton] = useState(false);
  const [activeVotes, setActiveVotes] = useState([]);
  const [cacheVoteIcrement, setCacheVoteIcrement] = useState(0);

  const [childCount, setChildCount] = useState(comment.children);
  const [replies, setReplies] = useState(comment.replies);
  const _depth = commentNumber || comment.level;
  const _currentUsername = currentAccountUsername || currentAccount?.username

  // useEffect(() => {
  //   if (isShowSubComments) {
  //     setTimeout(() => {
  //       if (repliesContainerRef.current) {
  //         setIsShowSubComments(true);
  //         repliesContainerRef.current.slideInRight(300);
  //       }
  //     }, 150);
  //   }
  // }, []);


  useEffect(() => {
    if (comment) {
      setActiveVotes(get(comment, 'active_votes', []));
    }
  }, [comment]);

  // useEffect(() => {
  //   const postPath = `${comment.author || ''}/${comment.permlink || ''}`;
  //   // this conditional makes sure on targetted already fetched post is updated
  //   // with new cache status, this is to avoid duplicate cache merging
  //   if (
  //     lastCacheUpdate &&
  //     lastCacheUpdate.postPath === postPath &&
  //     lastCacheUpdate.type === 'comment' &&
  //     lastCacheUpdate.updatedAt > fetchedAt
  //   ) {
  //     // TODO: update comment count and show sub comment if required;
  //     const cachedComment = cachedComments.get(postPath);
  //     if (cachedComment.updated === cachedComment.created) {
  //       if (_depth > 1 && incrementRepliesCount) {
  //         incrementRepliesCount();
  //       }
  //       setChildCount(childCount + 1);
  //       setReplies(replies ? [...replies, cachedComment] : [cachedComment]);
  //     }

  //     if (!_isShowSubComments) {
  //       _showSubCommentsToggle(true);
  //     }
  //   }
  // }, [lastCacheUpdate]);

  const _showSubCommentsToggle = (force) => {
    if ((replies && replies.length > 0) || force) {

      handleOnToggleReplies(comment.commentKey, !_isShowSubComments)
      setIsShowSubComments(!_isShowSubComments);
      // setIsPressedShowButton(true);
    } else if (openReplyThread) {
      openReplyThread(comment);
    }
  };

  const _handleCacheVoteIncrement = () => {
    // fake increment vote using based on local change
    setCacheVoteIcrement(1);
  };

  const _incrementRepliesCount = () => {
    if (_depth > 1 && incrementRepliesCount) {
      incrementRepliesCount();
    }
    setChildCount(childCount + 1);
  };

  const _handleOnReplyPress = () => {
    if (isLoggedIn) {
      dispatch(showReplyModal(comment));
    } else {
      console.log('Not LoggedIn');
    }
  };

  const _renderReadMoreButton = () => (
    <TextWithIcon
      wrapperStyle={styles.rightButton}
      textStyle={!isPressedShowButton && styles.moreText}
      iconType="MaterialIcons"
      isClickable
      iconStyle={styles.iconStyle}
      iconSize={16}
      onPress={() => openReplyThread && openReplyThread(comment)}
      text={!isPressedShowButton ? intl.formatMessage({ id: 'comments.read_more' }) : ''}
    />
  );

  const _renderReplies = () => {
    return (
      <AnimatedView ref={repliesContainerRef}>
        {_isShowSubComments && (
          <Comments
            isShowComments={isShowComments}
            commentNumber={_depth + 1}
            isShowSubComments={true}
            avatarSize={avatarSize || 24}
            author={comment.author}
            permlink={comment.permlink}
            commentCount={childCount}
            comments={comment.replies}
            hasManyComments={_depth === 5 && get(comment, 'children') > 0}
            fetchPost={fetchPost}
            hideManyCommentsButton={hideManyCommentsButton}
            mainAuthor={mainAuthor}
            fetchedAt={fetchedAt}
            incrementRepliesCount={_incrementRepliesCount}
            handleOnReplyPress={_handleOnReplyPress}
          />
        )}
      </AnimatedView>
    );
  };

  const _renderComment = () => {
    return (
      <View style={[{ marginLeft: 2, marginTop: -6 }]}>
        <CommentBody
          commentDepth={comment.depth}
          reputation={comment.author_reputation}
          handleOnUserPress={handleOnUserPress}
          handleOnLongPress={()=>handleOnLongPress(comment)}
          body={comment.body}
          created={comment.created}
          key={`key-${comment.permlink}`}
          isMuted={isMuted}
        />

        <Fragment>
          <View style={styles.footerWrapper}>{_renderActionPanel()}</View>
          {_depth > 1 && childCount > 0 && !comment.replies?.length && _renderReadMoreButton()}
        </Fragment>
      </View>
    );
  };

  const _renderActionPanel = () => {
    return (
      <>
        <Upvote
          activeVotes={activeVotes}
          isShowPayoutValue
          content={comment}
          handleCacheVoteIncrement={_handleCacheVoteIncrement}
          parentType={postTypes.COMMENT}
        />
        <TextWithIcon
          iconName="heart-outline"
          iconSize={20}
          wrapperStyle={styles.leftButton}
          iconType="MaterialCommunityIcons"
          isClickable
          onPress={() =>
            handleOnVotersPress &&
            activeVotes.length > 0 &&
            handleOnVotersPress(activeVotes, comment)
          }
          text={activeVotes.length + cacheVoteIcrement}
          textStyle={styles.voteCountText}
        />

        {isLoggedIn && (
          <IconButton
            size={20}
            iconStyle={styles.leftIcon}
            style={styles.leftButton}
            name="comment-outline"
            onPress={_handleOnReplyPress}
            iconType="MaterialCommunityIcons"
          />
        )}

        {_currentUsername === comment.author && (
          <Fragment>
            <IconButton
              size={20}
              iconStyle={styles.leftIcon}
              style={styles.leftButton}
              name="create"
              onPress={() => handleOnEditPress && handleOnEditPress(comment)}
              iconType="MaterialIcons"
            />
            {!childCount && !activeVotes.length && comment.isDeletable && (
              <Fragment>
                <IconButton
                  size={20}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="delete-forever"
                  onPress={() => actionSheet.current.show()}
                  iconType="MaterialIcons"
                />
                <OptionsModal
                  ref={actionSheet}
                  options={[
                    intl.formatMessage({ id: 'alert.delete' }),
                    intl.formatMessage({ id: 'alert.cancel' }),
                  ]}
                  title={intl.formatMessage({ id: 'alert.delete' })}
                  destructiveButtonIndex={0}
                  cancelButtonIndex={1}
                  onPress={(index) => {
                    index === 0 ? handleDeleteComment(comment.permlink) : null;
                  }}
                />
              </Fragment>
            )}
          </Fragment>
        )}

        {_depth === 1 && childCount > 0 && (
          <View style={styles.rightButtonWrapper}>
            <TextWithIcon
              wrapperStyle={styles.rightButton}
              iconName={_isShowSubComments ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              textStyle={styles.moreText}
              iconType="MaterialIcons"
              isClickable
              iconStyle={styles.iconStyle}
              iconSize={16}
              onPress={() => _showSubCommentsToggle()}
              text={`${childCount} ${intl.formatMessage({ id: 'comments.more_replies' })}`}
            />
          </View>
        )}
      </>
    );
  };

  const customContainerStyle = _depth > 1 ? { paddingLeft: (_depth - 2) * 44, backgroundColor:EStyleSheet.value('$primaryLightBackground') } : null;

  return (
    <Fragment>
      <View style={{ ...styles.commentContainer, ...customContainerStyle }}>
        <PostHeaderDescription
          key={comment.permlink}
          date={getTimeFromNow(comment.created)}
          name={comment.author}
          reputation={comment.author_reputation}
          size={avatarSize || 40}
          currentAccountUsername={_currentUsername}
          isShowOwnerIndicator={mainAuthor === comment.author}
          isHideImage={isHideImage}
          inlineTime={true}
          customStyle={{ alignItems: 'flex-start', paddingLeft: 12 }}
          showDotMenuButton={true}
          handleOnDotPress={()=>handleOnLongPress(comment)}
          secondaryContentComponent={_renderComment()}
        />

        {/* {commentNumber > 0 && _renderReplies()} */}
      </View>
    </Fragment>
  );
};

export default CommentView;
