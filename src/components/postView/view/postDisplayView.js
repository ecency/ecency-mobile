import React, { PureComponent, Fragment } from 'react';
import {
  View, Text, ScrollView, Dimensions,
} from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import ActionSheet from 'react-native-actionsheet';

// Providers
import { userActivity } from '../../../providers/esteem/ePoint';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
import {
  PostPlaceHolder, StickyBar, TextWithIcon, NoPost,
} from '../../basicUIElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { CommentsDisplay } from '../../commentsDisplay';
import { ParentPost } from '../../parentPost';

// Styles
import styles from './postDisplayStyles';

const HEIGHT = Dimensions.get('window').width;

class PostDisplayView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {
      postHeight: 0,
      scrollHeight: 0,
      isLoadedComments: false,
    };
  }

  // Component Life Cycles
  componentDidMount() {
    const { currentAccount, isLoggedIn, isNewPost } = this.props;

    if (isLoggedIn && get(currentAccount, 'name') && !isNewPost) {
      userActivity(currentAccount.name, 10);
    }
  }

  // Component Functions
  _handleOnScroll = (event) => {
    const { y } = event.nativeEvent.contentOffset;

    this.setState({
      scrollHeight: HEIGHT + y,
    });
  };

  _handleOnPostLayout = (event) => {
    const { height } = event.nativeEvent.layout;

    this.setState({
      postHeight: height,
    });
  };

  _getTabBar = (isFixedFooter = false) => {
    const {
      currentAccount,
      fetchPost,
      handleOnEditPress,
      handleOnReplyPress,
      handleOnVotersPress,
      isLoggedIn,
      post,
    } = this.props;

    return (
      <StickyBar isFixedFooter={isFixedFooter}>
        <View style={styles.stickyWrapper}>
          <Upvote fetchPost={fetchPost} isShowPayoutValue content={post} />
          <TextWithIcon
            iconName="people"
            iconStyle={styles.barIcons}
            iconType="MaterialIcons"
            isClickable
            onPress={() => handleOnVotersPress && handleOnVotersPress(get(post, 'active_votes'))}
            text={get(post, 'vote_count')}
            textMarginLeft={20}
          />
          <TextWithIcon
            iconName="comment"
            iconStyle={styles.barIcons}
            iconType="MaterialIcons"
            isClickable
            text={get(post, 'children')}
            textMarginLeft={20}
          />
          <View style={styles.stickyRightWrapper}>
            {get(currentAccount, 'name') === get(post, 'author') && (
              <Fragment>
                {!get(post, 'children') && !get(post, 'vote_count') && (
                  <IconButton
                    iconStyle={styles.barIconRight}
                    iconType="MaterialIcons"
                    name="delete-forever"
                    onPress={() => this.ActionSheet.show()}
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
            {isLoggedIn && (
              <IconButton
                iconStyle={styles.barIconRight}
                iconType="MaterialIcons"
                name="reply"
                onPress={() => handleOnReplyPress && handleOnReplyPress()}
                style={styles.barIconButton}
              />
            )}
          </View>
        </View>
      </StickyBar>
    );
  };

  render() {
    const {
      post,
      fetchPost,
      parentPost,
      currentAccount: { name },
      isPostUnavailable,
      author,
      intl,
      handleOnRemovePress,
    } = this.props;
    const { postHeight, scrollHeight, isLoadedComments } = this.state;

    // const isPostEnd = scrollHeight > postHeight;
    const isGetComment = scrollHeight + 300 > postHeight;
    const formatedTime = post && getTimeFromNow(post.created);

    if (isGetComment && !isLoadedComments) this.setState({ isLoadedComments: true });

    if (isPostUnavailable) {
      return (
        <NoPost
          imageStyle={{ height: 200, width: 300 }}
          defaultText={`${intl.formatMessage({
            id: 'post.removed_hint',
          })} ${author}`}
        />
      );
    }

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll} onScroll={event => this._handleOnScroll(event)}>
          {parentPost && <ParentPost post={parentPost} />}

          <View style={styles.header}>
            {!post ? (
              <PostPlaceHolder />
            ) : (
              <View onLayout={event => this._handleOnPostLayout(event)}>
                {!!post.title && <Text style={styles.title}>{post.title}</Text>}
                <PostHeaderDescription
                  date={formatedTime}
                  name={author || post.author}
                  currentAccountUsername={name}
                  reputation={post.author_reputation}
                  tag={post.category}
                  size={16}
                />
                <PostBody body={post.body} />
                <View style={styles.footer}>
                  <Tags tags={post.json_metadata && post.json_metadata.tags} />
                  <Text style={styles.footerText}>
                    Posted by
                    {' '}
                    <Text style={styles.footerName}>{author || post.author}</Text>
                    {' '}
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
            />
          )}
        </ScrollView>
        {post && this._getTabBar(true)}
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={[intl.formatMessage({ id: 'alert.delete' }), intl.formatMessage({ id: 'alert.cancel' })]}
          title={intl.formatMessage({ id: 'alert.remove_alert' })}
          cancelButtonIndex={1}
          onPress={index => (index === 0 ? handleOnRemovePress(get(post, 'permlink')) : null)}
        />
      </View>
    );
  }
}

export default injectIntl(PostDisplayView);
