import React, { Fragment, useState, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useIntl } from 'react-intl';

import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetManager } from 'react-native-actions-sheet';
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
import { PostTypes } from '../../../constants/postTypes';
import { UpvoteButton } from '../../postCard/children/upvoteButton';
import { PostPoll } from '../../postPoll';
import { ContentType } from '../../../providers/hive/hive.types';
import { SheetNames } from '../../../navigation/sheets';

const CommentView = ({
  avatarSize,
  comment,
  currentAccountUsername,
  commentNumber,
  handleDeleteComment,
  handleOnEditPress,
  handleOnMenuPress,
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
  onUpvotePress,
  handleParaSelection,
}) => {
  const intl = useIntl();

  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const isHideImage = useAppSelector((state) => state.application.hidePostsThumbnails);

  const isMuted = useMemo(
    () => currentAccount.mutes?.indexOf(comment.author) > -1,
    [currentAccount],
  );

  const activeVotes = comment?.active_votes || [];
  const [isOpeningReplies, setIsOpeningReplies] = useState(false);

  const childCount = comment.children;
  const { replies } = comment;
  const _depth = commentNumber || comment.level;
  const _currentUsername = currentAccountUsername || currentAccount?.username;

  const _showSubCommentsToggle = async (force = false) => {
    if (
      !!handleOnToggleReplies &&
      !!comment.commentKey &&
      ((replies && replies.length > 0) || force)
    ) {
      setIsOpeningReplies(true);
      await delay(10); // hack to rendering inidcator first before start loading comments
      handleOnToggleReplies(comment.commentKey);
      setIsOpeningReplies(false);
    } else if (openReplyThread) {
      openReplyThread(comment);
    }
  };

  const _handleOnReplyPress = () => {
    if (isLoggedIn) {
      SheetManager.show(SheetNames.QUICK_POST, {
        payload: {
          mode: 'comment',
          parentPost: comment,
        },
      });
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
    const _hideContent =
      isMuted || comment.stats?.gray || comment.author_reputation < 25 || comment.net_rshares < 0;

    return (
      <View style={[{ marginLeft: 2, marginTop: -6 }]}>
        <CommentBody
          body={comment.body}
          metadata={comment.json_metadata}
          key={`key-${comment.permlink}`}
          hideContent={_hideContent}
          commentDepth={_depth}
          handleOnUserPress={handleOnUserPress}
          handleLinkPress={handleLinkPress}
          handleImagePress={handleImagePress}
          handleVideoPress={handleVideoPress}
          handleYoutubePress={handleYoutubePress}
          handleParaSelection={handleParaSelection}
        />

        {comment.json_metadata.content_type === ContentType.POLL && (
          <PostPoll
            author={comment.author}
            permlink={comment.permlink}
            metadata={comment.json_metadata}
            compactView={true}
          />
        )}

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
          onUpvotePress={(sourceRef, onVotingStart) => {
            onUpvotePress({ content: comment, sourceRef, onVotingStart });
          }}
          onPayoutDetailsPress={(sourceRef) => {
            onUpvotePress({ content: comment, sourceRef, showPayoutDetails: true });
          }}
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
                onPress={() => handleDeleteComment(comment.permlink, comment.parent_permlink)}
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
    <Fragment key={comment.permlink}>
      <View style={{ ...styles.commentContainer, ...customContainerStyle }}>
        <PostHeaderDescription
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
          handleOnDotPress={() => handleOnMenuPress(comment)}
          profileOnPress={handleOnUserPress}
          secondaryContentComponent={_renderComment()}
        />
      </View>
    </Fragment>
  );
};

export default CommentView;
