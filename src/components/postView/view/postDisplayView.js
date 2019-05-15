import React, { PureComponent, Fragment } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { injectIntl } from 'react-intl';

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

    if (isLoggedIn && currentAccount && currentAccount.name && !isNewPost) {
      userActivity(currentAccount.name, 10);
    }
  }

  // Component Functions
  _handleOnScroll = event => {
    const { y } = event.nativeEvent.contentOffset;

    this.setState({
      scrollHeight: HEIGHT + y,
    });
  };

  _handleOnPostLayout = event => {
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
            onPress={() => handleOnVotersPress && handleOnVotersPress(post.active_votes)}
            text={post && post.vote_count}
            textMarginLeft={20}
          />
          <TextWithIcon
            iconName="comment"
            iconStyle={styles.barIcons}
            iconType="MaterialIcons"
            isClickable
            text={post && post.children}
            textMarginLeft={20}
          />
          <View style={styles.stickyRightWrapper}>
            {post && currentAccount && currentAccount.name === post.author && (
              <IconButton
                iconStyle={styles.barIconRight}
                iconType="MaterialIcons"
                name="create"
                onPress={() => handleOnEditPress && handleOnEditPress()}
                style={styles.barIconButton}
              />
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
      <Fragment>
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
<<<<<<< HEAD
                    Posted by <Text style={styles.footerName}>{post.author}</Text> {formatedTime}
=======
                    Posted by
                    {' '}
                    <Text style={styles.footerName}>{author || post.author}</Text>
                    {' '}
                    {formatedTime}
>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
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
      </Fragment>
    );
  }
}

export default injectIntl(PostDisplayView);
