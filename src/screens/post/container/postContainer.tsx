import React, { useState, useEffect, useRef } from 'react';
import { connect, useSelector } from 'react-redux';
import get from 'lodash/get';

// Services and Action
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { getPost } from '../../../providers/hive/dhive';

// Component
import PostScreen from '../screen/postScreen';
import { useGetPostQuery } from '../../../providers/queries';
import { useAppSelector } from '../../../hooks';

/*
 *            Props Name        Description                                     Value
 *@props -->  content           which is include all post data                  Object
 *
 */
const PostContainer = ({ currentAccount, isLoggedIn, route }) => {

  const params = route.params || {};

  const [post, setPost] = useState<any>(null);
  const [error, setError] = useState<Error|null>(null);
  const [isPostUnavailable, setIsPostUnavailable] = useState(false);

  const [author, setAuthor] = useState(params.content?.author || params.author);
  const [permlink, setPermlink] = useState(params.content?.permlink || params.permlink);

  const deviceOrientation = useAppSelector((state) => state.ui.deviceOrientation);

  //refs
  const isNewPost = useRef(route.params?.isNewPost).current;

  const getPostQuery = useGetPostQuery(author, permlink)
  const getParentPostQuery = useGetPostQuery();


  useEffect(() => {
    const { content } = route.params ?? {};
    if (!author && !permlink && content) {
        setPost(content);
    } 
  }, []);

  useEffect(()=>{
    if(getPostQuery.data){
      setPost(getPostQuery.data);
    }
  }, [getPostQuery.data])

  useEffect(()=>{
    if(post && post.depth > 0 && post.parent_author && post.parent_permlink){
      getParentPostQuery.setAuthor(post.parent_author);
      getParentPostQuery.setPermlink(post.parent_permlink);
    }
  }, [post])


  // Component Functions

  const _loadPost = async (_author = null, _permlink = null) => {

    if(_author && _permlink && _author !== author && _permlink !== _permlink){
      setAuthor(_author);
      setPermlink(_permlink);
    }

    getPostQuery.refetch();
  };

  useEffect(() => {
    const { isFetch: nextIsFetch } = route.params ?? {};
    if (nextIsFetch) {
      const { author: _author, permlink } = route.params;

      _loadPost(_author, permlink);
    }
  }, [route.params.isFetch]);


  return (
    <PostScreen
      currentAccount={currentAccount}
      error={error}
      author={author}
      fetchPost={_loadPost}
      isFetchComments
      isLoggedIn={isLoggedIn}
      isNewPost={isNewPost}
      parentPost={getParentPostQuery.data}
      post={post}
      isPostUnavailable={isPostUnavailable}
      orientation={deviceOrientation}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(PostContainer));
