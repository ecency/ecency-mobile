import React, { Fragment, useState, useRef, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useIntl } from 'react-intl';

import { useDispatch } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getTimeFromNow } from '../../../utils/time';
import { delay } from '../../../utils/editor';
// Constants

// Components
import { CommentBody, PostHeaderDescription } from '../../postElements';
import { IconButton } from '../../iconButton';
import { TextWithIcon } from '../../basicUIElements';

// Styles
import styles from './commentStyles';
import { useAppSelector } from '../../../hooks';
import { showReplyModal } from '../../../redux/actions/uiAction';
import { PostTypes } from '../../../constants/postTypes';
import { UpvoteButton } from '../../postCard/children/upvoteButton';

const CommentView = ({
  avatarSize,
  comment,
  currentAccountUsername,
  commentNumber,
  handleDeleteComment,
  handleOnEditPress,
  handleOnLongPress,
  handleOnUserPress,
  handleOnVotersPress,
  handleLinkPress,
  handleImagePress,
  handleYoutubePress,
  handleVideoPress,
  mainAuthor = { mainAuthor },
  openReplyThread,
  repliesToggle,
  handleOnToggleReplies,
  onUpvotePress
}) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isHideImage = useAppSelector((state) => state.application.hidePostsThumbnails);

  const isMuted = useMemo(
    () => currentAccount.mutes?.indexOf(comment.author) > -1,
    [currentAccount],
  );

  const activeVotes = useMemo(() => comment?.active_votes || [], [comment]);
  const [isOpeningReplies, setIsOpeningReplies] = useState(false);


  const childCount = comment.children;
  const { replies } = comment;
  const _depth = commentNumber || comment.level;
  const _currentUsername = currentAccountUsername || currentAccount?.username;


  const _showSubCommentsToggle = async (force = false) => {
    if ((replies && replies.length > 0) || force) {
      setIsOpeningReplies(true);
      await delay(10); //hack to rendering inidcator first before start loading comments
      handleOnToggleReplies(comment.commentKey);
      setIsOpeningReplies(false);
    } else if (openReplyThread) {
      openReplyThread(comment);
    }
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
      textStyle={styles.moreText}
      iconType="MaterialIcons"
      isClickable
      iconStyle={styles.iconStyle}
      iconSize={16}
      onPress={() => openReplyThread && openReplyThread(comment)}
      text={intl.formatMessage({ id: 'comments.read_more' })}
    />
  );

  const _renderComment = () => {
    return (
      <View style={[{ marginLeft: 2, marginTop: -6 }]}>
        <CommentBody
          commentDepth={_depth}
          reputation={comment.author_reputation}
          handleOnUserPress={handleOnUserPress}
          handleOnLongPress={() => handleOnLongPress(comment)}
          handleLinkPress={handleLinkPress}
          handleImagePress={handleImagePress}
          handleVideoPress={handleVideoPress}
          handleYoutubePress={handleYoutubePress}
          body={comment.body}
          key={`key-${comment.permlink}`}
          isMuted={isMuted}
        />

        <Fragment>
          <View style={styles.footerWrapper}>{_renderActionPanel()}</View>
          {_depth > 2 && childCount > 0 && _renderReadMoreButton()}
        </Fragment>
      </View>
    );
  };

  const _renderActionPanel = () => {
    return (
      <>
        <UpvoteButton
          content={comment}
          activeVotes={activeVotes}
          isShowPayoutValue={true}
          parentType={PostTypes.COMMENT}
          isVoting={false}
          onUpvotePress={(anchorRect)=>{onUpvotePress(anchorRect)}}
          onPayoutDetailsPress={(anchorRect)=>{onUpvotePress(anchorRect, true)}}
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
          text={activeVotes.length}
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
                <IconButton
                  size={20}
                  iconStyle={styles.leftIcon}
                  style={styles.leftButton}
                  name="delete-forever"
                  onPress={() => handleDeleteComment(comment.permlink)}
                  iconType="MaterialIcons"
                />
            )}
          </Fragment>
        )}

        {_depth === 1 && childCount > 0 && (
          <View style={styles.rightButtonWrapper}>
            {isOpeningReplies ? (
              <ActivityIndicator
                style={{ paddingHorizontal: 24, paddingBottom: 8 }}
                size="small"
                color={EStyleSheet.value('$iconColor')}
              />
            ) : (
              <TextWithIcon
                wrapperStyle={styles.rightButton}
                iconName={repliesToggle ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                textStyle={styles.moreText}
                iconType="MaterialIcons"
                isClickable
                iconStyle={styles.iconStyle}
                iconSize={16}
                onPress={() => _showSubCommentsToggle()}
                text={`${childCount} ${intl.formatMessage({ id: 'comments.more_replies' })}`}
              />
            )}
          </View>
        )}
      </>
    );
  };

  const customContainerStyle =
    _depth > 1
      ? {
          paddingLeft: (_depth - 2) * 44,
          backgroundColor: EStyleSheet.value('$primaryLightBackground'),
        }
      : null;

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
          handleOnDotPress={() => handleOnLongPress(comment)}
          profileOnPress={handleOnUserPress}
          secondaryContentComponent={_renderComment()}
        />
      </View>
    </Fragment>
  );
};

export default CommentView;
