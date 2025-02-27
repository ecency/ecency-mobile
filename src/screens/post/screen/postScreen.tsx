import React, { useState, useRef, useEffect, useMemo } from 'react';

// Components
import { Image as ExpoImage } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BasicHeader, IconButton, PostDisplay, PostOptionsModal } from '../../../components/index';
import styles from '../styles/postScreen.styles';

// Component
import { postQueries, usePlausibleTracker } from '../../../providers/queries';
import ROUTES from '../../../constants/routeNames';
import { useAppSelector } from '../../../hooks';

const PostScreen = ({ route }) => {
  const params = route.params || {};
  const tracker = usePlausibleTracker();
  const navigation = useNavigation();

  // // refs
  const isNewPost = useRef(route.params?.isNewPost).current;
  const postOptionsModalRef = useRef<typeof PostOptionsModal | null>(null);

  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const [author, setAuthor] = useState(params.content?.author || params.author);
  const [permlink, setPermlink] = useState(params.content?.permlink || params.permlink);
  const [parentAuthor, setParentAuthor] = useState('');
  const [parentPermlink, setParentPermlink] = useState('');
  const [isOwnPost, setIsOwnPost] = useState(false);

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

      setIsOwnPost(currentAccount.username === post.author);
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

  const _onEditPress = () => {
    if (getPostQuery.data) {
      const isReply = parentAuthor;

      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${permlink}`,
        params: {
          isEdit: true,
          isReply,
          post: getPostQuery.data,
          fetchPost: _loadPost,
        },
      } as never);
    }
  };

  const _editIconProps = isOwnPost && {
    rightIconName: 'create',
    iconType: 'MaterialIcons',
    rightIconStyle: { fontSize: 20 },
    handleRightIconPress: _onEditPress,
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
    <SafeAreaView edges={['top']} style={styles.container}>
      <BasicHeader
        isHasDropdown={true}
        title="Post"
        content={getPostQuery.data}
        dropdownComponent={_postOptionsBtn}
        isNewPost={isNewPost}
        {..._editIconProps}
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
    </SafeAreaView>
  );
};

export default PostScreen;
