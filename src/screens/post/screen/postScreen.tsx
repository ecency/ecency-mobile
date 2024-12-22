import React, { useState, useRef, useEffect, useMemo } from 'react';
import { View } from 'react-native';

// Components
import { Image as ExpoImage } from 'expo-image';
import { BasicHeader, IconButton, PostDisplay, PostOptionsModal } from '../../../components/index';
import styles from '../styles/postScreen.styles';

// Component
import { postQueries, usePlausibleTracker } from '../../../providers/queries';

const PostScreen = ({ route }) => {
  const params = route.params || {};
  const tracker = usePlausibleTracker();

  // // refs
  const isNewPost = useRef(route.params?.isNewPost).current;
  const postOptionsModalRef = useRef<typeof PostOptionsModal | null>(null);

  const [author, setAuthor] = useState(params.content?.author || params.author);
  const [permlink, setPermlink] = useState(params.content?.permlink || params.permlink);
  const [parentAuthor, setParentAuthor] = useState('');
  const [parentPermlink, setParentPermlink] = useState('');

  const getPostQuery = postQueries.useGetPostQuery({
    author,
    permlink,
    initialPost: params.content,
  });
  const getParentPostQuery = postQueries.useGetPostQuery({
    author: parentAuthor,
    permlink: parentPermlink,
  });

  const isWavePost = useMemo(
    () => getPostQuery.data?.parent_author === 'ecency.waves',
    [getPostQuery.data],
  ); // TODO: implement a better generic way to avoid parent fetching for waves

  const isSubPost = useMemo(
    () => !!getPostQuery.data?.parent_author || !!getPostQuery.data?.parent_permlink,
    [getPostQuery.data],
  ); // check if post opened have any parent post, this is for showing translation modal for sub posts like waves and comments

  useEffect(() => {
    return () => {
      // clears ExpoImage RAM, not disk usage;
      ExpoImage.clearMemoryCache();
    };
  }, []);

  useEffect(() => {
    const post = getPostQuery.data;

    if (post) {
      tracker.recordEvent(post.url, true);

      const _fetchParent =
        post && post.depth > 0 && post.parent_author && post.parent_permlink && !isWavePost;

      if (_fetchParent) {
        setParentAuthor(post.parent_author);
        setParentPermlink(post.parent_permlink);
      }
    }
  }, [getPostQuery.data]);

  // // Component Functions
  const _loadPost = async (_author = null, _permlink = null) => {
    if (_author && _permlink && _author !== author && _permlink !== _permlink) {
      setAuthor(_author);
      setPermlink(_permlink);
    }
    getPostQuery.refetch();
  };

  const _isPostUnavailable = !getPostQuery.isLoading && getPostQuery.error;

  const _onPostOptionsBtnPress = (content = getPostQuery.data) => {
    if (postOptionsModalRef.current) {
      postOptionsModalRef.current.show(content);
    }
  };

  const _postOptionsBtn = (
    <IconButton
      iconStyle={styles.optionsIcon}
      iconType="MaterialCommunityIcons"
      name="dots-vertical"
      onPress={_onPostOptionsBtnPress}
      size={24}
    />
  );

  return (
    <View style={styles.container}>
      <BasicHeader
        isHasDropdown={true}
        title="Post"
        content={getPostQuery.data}
        dropdownComponent={_postOptionsBtn}
        isNewPost={isNewPost}
      />
      <PostDisplay
        author={author}
        permlink={permlink}
        isPostUnavailable={_isPostUnavailable}
        fetchPost={_loadPost}
        isFetchComments={true}
        isNewPost={isNewPost}
        parentPost={getParentPostQuery.data}
        post={getPostQuery.data}
        isWavePost={isWavePost}
      />
      <PostOptionsModal
        ref={postOptionsModalRef}
        isWave={isWavePost}
        isVisibleTranslateModal={isSubPost}
      />
    </View>
  );
};

export default PostScreen;
