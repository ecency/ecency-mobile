import React, { useCallback, useEffect, useRef, useState, Fragment } from 'react';
import { View, Text, ScrollView, Dimensions, SafeAreaView, RefreshControl } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';

// Providers
import { userActivity } from '../../../providers/esteem/ePoint';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
import { PostPlaceHolder, StickyBar, TextWithIcon, NoPost } from '../../basicUIElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { CommentsDisplay } from '../../commentsDisplay';
import { ParentPost } from '../../parentPost';

// Styles
import styles from './postDisplayStyles';

const HEIGHT = Dimensions.get('window').width;

const PostDisplayView = ({
  currentAccount,
  isLoggedIn,
  isNewPost,
  fetchPost,
  handleOnEditPress,
  handleOnReplyPress,
  handleOnVotersPress,
  handleOnReblogsPress,
  post,
  intl,
  parentPost,
  isPostUnavailable,
  author,
  handleOnRemovePress,
}) => {
  const [postHeight, setPostHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);
  const [isLoadedComments, setIsLoadedComments] = useState(false);
  const actionSheet = useRef(null);
  const [refreshing, setRefreshing] = useState(false);

  // Component Life Cycles
  useEffect(() => {
    if (isLoggedIn && get(currentAccount, 'name') && !isNewPost) {
      userActivity(currentAccount.name, 10);
    }
  }, []);

  // Component Functions
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPost().then(() => setRefreshing(false));
  }, [refreshing]);

  const _handleOnScroll = event => {
    const { y } = event.nativeEvent.contentOffset;

    setScrollHeight(HEIGHT + y);
  };

  const _handleOnPostLayout = event => {
    const { height } = event.nativeEvent.layout;

    setPostHeight(height);
  };

  const _getTabBar = (isFixedFooter = false) => {
    return (
      <SafeAreaView>
        <StickyBar isFixedFooter={isFixedFooter}>
          <View style={styles.stickyWrapper}>
            <Upvote fetchPost={fetchPost} isShowPayoutValue content={post} />
            <TextWithIcon
              iconName="heart-outline"
              iconStyle={styles.barIcons}
              iconType="MaterialCommunityIcons"
              isClickable
              onPress={() => handleOnVotersPress && handleOnVotersPress(get(post, 'active_votes'))}
              text={get(post, 'vote_count', 0)}
              textMarginLeft={20}
            />
            <TextWithIcon
              iconName="repeat"
              iconStyle={styles.barIcons}
              iconType="MaterialIcons"
              isClickable
              onPress={() => handleOnReblogsPress && handleOnReblogsPress(get(post, 'reblogs'))}
              text={get(post, 'reblogCount', 0)}
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
                onPress={() => handleOnReplyPress && handleOnReplyPress()}
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
                  {!get(post, 'children') && !get(post, 'vote_count') && (
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
      </SafeAreaView>
    );
  };

  const { name } = currentAccount;

  // const isPostEnd = scrollHeight > postHeight;
  const isGetComment = scrollHeight + 300 > postHeight;
  const formatedTime = post && getTimeFromNow(post.created);

  if (isGetComment && !isLoadedComments) {
    setIsLoadedComments(true);
  }

  if (isPostUnavailable) {
    return (
      <NoPost
        imageStyle={styles.noPostImage}
        defaultText={`${intl.formatMessage({
          id: 'post.removed_hint',
        })} ${author}`}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        onScroll={event => _handleOnScroll(event)}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {parentPost && <ParentPost post={parentPost} />}

        <View style={styles.header}>
          {!post ? (
            <PostPlaceHolder />
          ) : (
            <View onLayout={event => _handleOnPostLayout(event)}>
              {!!post.title && <Text style={styles.title}>{post.title}</Text>}
              <PostHeaderDescription
                date={formatedTime}
                name={author || post.author}
                currentAccountUsername={name}
                reputation={post.author_reputation}
                tag={post.category}
                size={36}
              />
              <PostBody body={post.body} />
              <View style={styles.footer}>
                <Tags tags={post.json_metadata && post.json_metadata.tags} />
                <Text style={styles.footerText}>
                  Posted by
                  <Text style={styles.footerName}>{` ${author || post.author} `}</Text>
                  {formatedTime}
                </Text>
                {/* {isPostEnd && this._getTabBar()} */}
              </View>
            </View>
          )}
        </View>
        {post && (isGetComment || isLoadedComments) && (
          <CommentsDisplay
            author={author || post.author}
            mainAuthor={author || post.author}
            permlink={post.permlink}
            commentCount={post.children}
            fetchPost={fetchPost}
            handleOnVotersPress={handleOnVotersPress}
          />
        )}
      </ScrollView>
      {post && _getTabBar(true)}
      <ActionSheet
        ref={actionSheet}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_alert' })}
        cancelButtonIndex={1}
        onPress={index => (index === 0 ? handleOnRemovePress(get(post, 'permlink')) : null)}
      />
    </View>
  );
};

export default injectIntl(PostDisplayView);
