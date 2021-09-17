import React, { useState, Fragment, useRef, useEffect } from 'react';
import { FlatList } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import get from 'lodash/get';
import { useIntl } from 'react-intl';
import { navigate } from '../../../navigation/service';

// Components
import { Comment, TextButton } from '../..';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './commentStyles';
import EStyleSheet from 'react-native-extended-stylesheet';


const CommentsView = ({
  avatarSize,
  commentCount,
  commentNumber,
  comments,
  currentAccountUsername,
  fetchPost,
  handleDeleteComment,
  handleOnEditPress,
  handleOnPressCommentMenu,
  handleOnReplyPress,
  handleOnUserPress,
  handleOnVotersPress,
  hasManyComments,
  isHideImage,
  isLoggedIn,
  isOwnProfile,
  isShowSubComments,
  mainAuthor,
  marginLeft,
  isShowMoreButton,
  showAllComments,
  hideManyCommentsButton,
  onScroll,
  onEndReached,
  flatListProps,
  openReplyThread,
}) => {
  const [selectedComment, setSelectedComment] = useState(null);
  const intl = useIntl();
  const commentMenu = useRef();

  useEffect(() => {
    if(selectedComment && commentMenu.current){
      commentMenu.current.show();
    }
  }, [selectedComment])

  const _openCommentMenu = (item) => {
    setSelectedComment(item);
  };

  const _openReplyThread = (item) => {
    if(item && openReplyThread){
      openReplyThread(item)
    }
    
  }

  const _readMoreComments = () => {
    if(comments[0] && openReplyThread){
      openReplyThread(comments[0])
    }
  };

  const _onMenuItemPress = (index) => {
    handleOnPressCommentMenu(index, selectedComment)
    setSelectedComment(null);
  }

  const menuItems = [
    intl.formatMessage({ id: 'post.copy_link' }),
    intl.formatMessage({ id: 'post.copy_text' }),
    intl.formatMessage({ id: 'post.open_thread' }),
    intl.formatMessage({ id: 'alert.cancel' }),
  ];


  if (!hideManyCommentsButton && hasManyComments) {
    return (
      <TextButton
        style={styles.moreRepliesButtonWrapper}
        textStyle={styles.moreRepliesText}
        onPress={() => _readMoreComments()}
        text={intl.formatMessage({ id: 'comments.read_more' })}
      />
    );
  }


  const _renderItem = ({ item }) => {
    return (
      <Comment
        mainAuthor={mainAuthor}
        avatarSize={avatarSize}
        hideManyCommentsButton={hideManyCommentsButton}
        comment={item}
        commentCount={commentCount || get(item, 'children')}
        commentNumber={commentNumber}
        handleDeleteComment={handleDeleteComment}
        currentAccountUsername={currentAccountUsername}
        fetchPost={fetchPost}
        handleOnEditPress={handleOnEditPress}
        handleOnReplyPress={handleOnReplyPress}
        handleOnUserPress={handleOnUserPress}
        handleOnVotersPress={handleOnVotersPress}
        isHideImage={isHideImage}
        isLoggedIn={isLoggedIn}
        isShowMoreButton={isShowMoreButton || (commentNumber === 1 && get(item, 'children') > 0)}
        showAllComments={showAllComments}
        isShowSubComments={isShowSubComments}
        key={get(item, 'permlink')}
        marginLeft={marginLeft}
        handleOnLongPress={() => _openCommentMenu(item)}
        openReplyThread={()=> _openReplyThread(item)}
      />
    )
  };


  const styleOerride = commentNumber > 1 ? {
    backgroundColor:EStyleSheet.value('$primaryLightBackground'),
    marginTop:8,
  }:null


  return (
    <Fragment>
      <FlatList
        style={{...styles.list, ...styleOerride  }}
        contentContainerStyle={{padding:0}}
        data={comments}
        renderItem={_renderItem}
        keyExtractor={(item) => get(item, 'permlink')}
        {...flatListProps}
      />
      <ActionSheet
        ref={commentMenu}
        options={menuItems}
        title={get(selectedComment, 'summary')}
        cancelButtonIndex={3}
        onPress={_onMenuItemPress}
      />
    </Fragment>
  );
};

export default CommentsView;
