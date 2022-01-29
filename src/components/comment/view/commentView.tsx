import React, { Fragment, useState, useRef, useEffect } from 'react';
import { View } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import { View as AnimatedView } from 'react-native-animatable';

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

const CommentView = ({
  avatarSize,
  comment,
  commentNumber,
  currentAccountUsername,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnLongPress,
  handleOnReplyPress,
  handleOnUserPress,
  handleOnVotersPress,
  isLoggedIn,
  isShowComments,
  isShowMoreButton,
  mainAuthor = { mainAuthor },
  isHideImage,
  showAllComments,
  isShowSubComments,
  hideManyCommentsButton,
  openReplyThread,
  fetchedAt,
}) => {
  const intl = useIntl();
  const actionSheet = useRef(null);

  const isMuted = useAppSelector(state => state.account.currentAccount.mutes?.indexOf(comment.author) > -1);

  const [_isShowSubComments, setIsShowSubComments] = useState(isShowSubComments || false);
  const [isPressedShowButton, setIsPressedShowButton] = useState(false);
  const [activeVotes, setActiveVotes] = useState([]);
  const [cacheVoteIcrement, setCacheVoteIcrement] = useState(0);



  useEffect(() => {
    if (comment) {
      setActiveVotes(get(comment, 'active_votes', []));
    }
  }, [comment]);

  const _showSubCommentsToggle = () => {
    if(comment.replies && comment.replies.length > 0){
      setIsShowSubComments(!_isShowSubComments);
      setIsPressedShowButton(true);
    } else if(openReplyThread) {
      openReplyThread();
    }

  };

  const _handleCacheVoteIncrement = () => {
    //fake increment vote using based on local change
    setCacheVoteIcrement(1);
  };


  const _renderReadMoreButton = () => (
    <TextWithIcon
      wrapperStyle={styles.rightButton}
      textStyle={!isPressedShowButton && styles.moreText}
      iconType="MaterialIcons"
      isClickable
      iconStyle={styles.iconStyle}
      iconSize={16}
      onPress={() => openReplyThread && openReplyThread()}
      text={
        !isPressedShowButton
          ? intl.formatMessage({ id: 'comments.read_more' })
          : ''
      }
    />

 )

  const _renderReplies = () => {
    return (
      <AnimatedView animation="zoomIn" duration={300}>
        <Comments
          isShowComments={isShowComments}
          commentNumber={commentNumber + 1}
          marginLeft={20}
          isShowSubComments={true}
          avatarSize={avatarSize || 24}
          author={comment.author}
          permlink={comment.permlink}
          commentCount={comment.children}
          comments={comment.replies}
          isShowMoreButton={false}
          hasManyComments={commentNumber === 5 && get(comment, 'children') > 0}
          fetchPost={fetchPost}
          hideManyCommentsButton={hideManyCommentsButton}
          mainAuthor={mainAuthor}
          fetchedAt={fetchedAt}
        />
      </AnimatedView>
     
    )
  }


  const _renderComment = () => {
    return ((
      <View style={[{ marginLeft: 2, marginTop: -6 }]}>
        <CommentBody
          commentDepth={comment.depth}
          reputation={comment.author_reputation}
          handleOnUserPress={handleOnUserPress}
          handleOnLongPress={handleOnLongPress}
          body={comment.body}
          created={comment.created}
          key={`key-${comment.permlink}`}
          isMuted={isMuted}
        />
        
        <Fragment>
          <View style={styles.footerWrapper}>
            {_renderActionPanel()}
          </View>
          { commentNumber > 1 && 
            comment.children > 0 && 
            !comment.replies?.length && 
            _renderReadMoreButton() 
          }
        </Fragment>
      </View>
    ))
  }


  const _renderActionPanel = () => {
    return (
      <>
        <Upvote 
          activeVotes={activeVotes} 
          isShowPayoutValue 
          content={comment}
          handleCacheVoteIncrement={_handleCacheVoteIncrement}
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
            onPress={() => handleOnReplyPress && handleOnReplyPress(comment)}
            iconType="MaterialCommunityIcons"
          />
        )}
       
         
        {currentAccountUsername === comment.author && (
          <Fragment>
            <IconButton
              size={20}
              iconStyle={styles.leftIcon}
              style={styles.leftButton}
              name="create"
              onPress={() => handleOnEditPress && handleOnEditPress(comment)}
              iconType="MaterialIcons"
            />
            {!comment.children && !activeVotes.length && (
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

        
        {isShowMoreButton && (
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
              text={`${comment.children} ${intl.formatMessage({ id: 'comments.more_replies' })}`}
            />
          </View>
        )}

      </>
    )
  }

  const customContainerStyle = commentNumber > 2 ? {marginLeft: 44}:null

  return (
    <Fragment>
      <View style={{...styles.commentContainer, ...customContainerStyle}}>
        <PostHeaderDescription
          key={comment.permlink}
          date={getTimeFromNow(comment.created)}
          name={comment.author}
          reputation={comment.author_reputation}
          size={avatarSize || 40}
          currentAccountUsername={currentAccountUsername}
          isShowOwnerIndicator={mainAuthor === comment.author}
          isHideImage={isHideImage}
          inlineTime={true}
          customStyle={{alignItems:'flex-start', paddingLeft: 12}}
          showDotMenuButton={true}
          handleOnDotPress={handleOnLongPress}
          secondaryContentComponent={_renderComment()}
        />

        {_isShowSubComments && commentNumber > 0 && _renderReplies()}
      </View>
    </Fragment>
  );
};

export default CommentView;
