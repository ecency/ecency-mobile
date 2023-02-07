import React, { useState, useEffect, useRef } from 'react';
import {Text} from 'react-native';
import { connect } from 'react-redux';

// Services and Action
import { gestureHandlerRootHOC, ScrollView } from 'react-native-gesture-handler';

// Component
import PostScreen from '../screen/postScreen';
import { postQueries } from '../../../providers/queries';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

/*
 *            Props Name        Description                                     Value
 *@props -->  content           which is include all post data                  Object
 *
 */
const PostContainer = ({ currentAccount, isLoggedIn, route }) => {
  const params = route.params || {};
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // const [author, setAuthor] = useState(params.content?.author || params.author || 'demo.com');
  // const [permlink, setPermlink] = useState(params.content?.permlink || params.permlink || 'dev-test-tag-test-going');

  // // refs
  // const isNewPost = useRef(route.params?.isNewPost).current;

  // const getPostQuery = postQueries.useGetPostQuery(author, permlink);
  // const getParentPostQuery = postQueries.useGetPostQuery();

  useEffect(()=>{
    //TODO: remove before PR, only for testing
    const timer = setTimeout(()=>{

      navigation.goBack();
      dispatch({
        type:"inc-scroll-index"
      })
    }, 100)

    return ()=> {
      if(timer){
        clearTimeout(timer)
      }
    }
  }, [])

  // useEffect(() => {
    // const post = getPostQuery.data;
    // if (post) {
    //   if (post && post.depth > 0 && post.parent_author && post.parent_permlink) {
    //     getParentPostQuery.setAuthor(post.parent_author);
    //     getParentPostQuery.setPermlink(post.parent_permlink);
    //   }
    // }


  // }, [getPostQuery.data]);

  // // Component Functions
  // const _loadPost = async (_author = null, _permlink = null) => {
  //   if (_author && _permlink && _author !== author && _permlink !== _permlink) {
  //     setAuthor(_author);
  //     setPermlink(_permlink);
  //   }
  //   getPostQuery.refetch();
  // };

  // // useEffect(() => {
  // //   const { isFetch: nextIsFetch } = route.params ?? {};
  // //   if (nextIsFetch) {
  // //     const { author: _author, permlink } = route.params;
  // //     _loadPost(_author, permlink);
  // //   }
  // // }, [route.params.isFetch]);

  // const _isPostUnavailable = !getPostQuery.isLoading && getPostQuery.error;

  return (
    // <PostScreen
    //   post={getPostQuery.data}
    //   currentAccount={currentAccount}
    //   author={author}
    //   fetchPost={_loadPost}
    //   isFetchComments
    //   isLoggedIn={isLoggedIn}
    //   isNewPost={isNewPost}
    //   parentPost={getParentPostQuery.data}
    //   isPostUnavailable={_isPostUnavailable}
    // />

    <ScrollView>
      <Text>{params.content.body}</Text>
    </ScrollView>
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
  isLoggedIn: state.application.isLoggedIn,
});

export default gestureHandlerRootHOC(connect(mapStateToProps)(PostContainer));
