import React, { Component } from 'react';
import {
  View, Text, ScrollView, Dimensions,
} from 'react-native';

// Constants

// Components
import { PostHeaderDescription, PostBody, Tags } from '../../postElements';
import { PostPlaceHolder, StickyBar, TextWithIcon } from '../../basicUIElements';
import { Upvote } from '../../upvote';
import { IconButton } from '../../iconButton';

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
    const { post, currentUser } = this.props;

    console.log(post);
    return (
      <StickyBar isFixedFooter={isFixedFooter}>
        <View style={styles.stickyWrapper}>
          <Upvote isShowpayoutValue content={post} user={currentUser} isLoggedIn={!!currentUser} />
          <TextWithIcon
            isClickable
            iconStyle={styles.barIcons}
            textMarginLeft={20}
            text={post && post.vote_count}
            iconName="ios-people"
          />
          <TextWithIcon
            isClickable
            iconStyle={styles.barIcons}
            textMarginLeft={20}
            text="64"
            iconName="comments"
            iconType="FontAwesome"
          />
          <View style={styles.stickyRightWrapper}>
            {post
              && currentUser
              && currentUser.name === post.author && (
                <IconButton
                  iconStyle={styles.barIconRight}
                  style={styles.barIconButton}
                  name="pencil"
                  iconType="SimpleLineIcons"
                  onPress={() => handleOnEditPress()}
                />
            )}
            <IconButton
              iconStyle={styles.barIconRight}
              style={styles.barIconButton}
              name="reply"
              onPress={() => handleOnReplyPress()}
              iconType="FontAwesome"
            />
          </View>
        </View>
      </StickyBar>
    );
  };

  render() {
    const { post, handleOnUserPress } = this.props;
    const { postHeight, scrollHeight } = this.state;

    const isPostEnd = scrollHeight > postHeight;

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scroll} onScroll={event => this._handleOnScroll(event)}>
          <View style={styles.header}>
            {!post ? (
              <PostPlaceHolder />
            ) : (
              <View onLayout={event => this._handleOnPostLayout(event)}>
                <Text style={styles.title}>{post.title}</Text>
                <PostHeaderDescription
                  handleOnUserPress={handleOnUserPress}
                  date={post.created}
                  name={post.author}
                  reputation={post.author_reputation}
                  tag={post.category}
                  avatar={post.avatar}
                  size={16}
                />
                {post
                  && post.body && <PostBody handleOnUserPress={handleOnUserPress} body={post.body} />}
                <View style={styles.footer}>
                  <Tags tags={post.json_metadata && post.json_metadata.tags} />
                  <Text style={styles.footerText}>
                    Posted by
                    {' '}
                    <Text style={styles.footerName}>{post.author}</Text>
                    {' '}
                    {post.created}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {isPostEnd && this._getTabBar()}
          {/* Comments Here! */}
        </ScrollView>
        {!isPostEnd && this._getTabBar(true)}
      </View>
    );
  }
}

export default PostDisplayView;
