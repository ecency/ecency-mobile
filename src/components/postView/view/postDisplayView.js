import React, { Component, Fragment } from 'react';
import {
  View, Text, ScrollView, Dimensions,
} from 'react-native';

// Constants

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
import { PostPlaceHolder, StickyBar, TextWithIcon } from '../../basicUIElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';
import { CommentsDisplay } from '../../commentsDisplay';

// Styles
import styles from './postDisplayStyles';

const HEIGHT = Dimensions.get('window').width;
class PostDisplayView extends Component {
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
      post,
      currentAccount,
      handleOnReplyPress,
      handleOnEditPress,
      handleOnVotersPress,
    } = this.props;

    return (
      <StickyBar isFixedFooter={isFixedFooter}>
        <View style={styles.stickyWrapper}>
          <Upvote isShowPayoutValue content={post} />
          <TextWithIcon
            isClickable
            iconStyle={styles.barIcons}
            textMarginLeft={20}
            text={post && post.vote_count}
            onPress={() => handleOnVotersPress && handleOnVotersPress(post.active_votes)}
            iconName="ios-people"
          />
          <TextWithIcon
            isClickable
            iconStyle={styles.barIcons}
            textMarginLeft={20}
            text={post && post.children}
            iconName="comments"
            iconType="FontAwesome"
          />
          <View style={styles.stickyRightWrapper}>
            {post && currentAccount && currentAccount.name === post.author && (
              <IconButton
                iconStyle={styles.barIconRight}
                style={styles.barIconButton}
                name="pencil"
                iconType="SimpleLineIcons"
                onPress={() => handleOnEditPress && handleOnEditPress()}
              />
            )}
            <IconButton
              iconStyle={styles.barIconRight}
              style={styles.barIconButton}
              name="reply"
              onPress={() => handleOnReplyPress && handleOnReplyPress()}
              iconType="FontAwesome"
            />
          </View>
        </View>
      </StickyBar>
    );
  };

  render() {
    const { post } = this.props;
    const { postHeight, scrollHeight, isLoadedComments } = this.state;

    const isPostEnd = scrollHeight > postHeight;
    const isGetComment = scrollHeight + 300 > postHeight;

    isGetComment && !isLoadedComments && this.setState({ isLoadedComments: true });

    return (
      <Fragment>
        <ScrollView style={styles.scroll} onScroll={event => this._handleOnScroll(event)}>
          <View style={styles.header}>
            {!post ? (
              <PostPlaceHolder />
            ) : (
              <View onLayout={event => this._handleOnPostLayout(event)}>
                <Text style={styles.title}>{post.title}</Text>
                <PostHeaderDescription
                  date={post.created}
                  name={post.author}
                  reputation={post.author_reputation}
                  tag={post.category}
                  avatar={post.avatar}
                  size={16}
                />
                {post && post.body && <PostBody body={post.body} />}
                <View style={[styles.footer, !isPostEnd && styles.marginFooter]}>
                  <Tags tags={post.json_metadata && post.json_metadata.tags} />
                  <Text style={styles.footerText}>
                    Posted by
                    {' '}
                    <Text style={styles.footerName}>{post.author}</Text>
                    {' '}
                    {post.created}
                  </Text>
                  {isPostEnd && this._getTabBar()}
                </View>
              </View>
            )}
          </View>
          {post && (isGetComment || isLoadedComments) && (
            <CommentsDisplay
              author={post.author}
              permlink={post.permlink}
              commentCount={post.children}
            />
          )}
        </ScrollView>
        {!isPostEnd && this._getTabBar(true)}
      </Fragment>
    );
  }
}

export default PostDisplayView;
