import React, { Component } from 'react';
import {
  Image, TouchableOpacity, Text,
} from 'react-native';
import {
  Card, CardItem, Left, Right, Thumbnail, Icon, Body,
} from 'native-base';
import { PostHeaderDescription } from '../../postElements';

// STEEM
import { Upvote } from '../../upvote';
// Styles
import styles from './postCardStyles';

class PostCard extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { string }     description       - Description texts.
    *   @prop { string }     iconName          - For icon render name.
    *
    */
  constructor(props) {
    super(props);

    this.state = {};
  }

  // Component Lifecycle Functions

  // Component Functions

  _handleOnUserPress = () => {
    const { handleOnUserPress, content, user } = this.props;

    if (handleOnUserPress && content && content.author !== user.name) {
      handleOnUserPress(content.author, content.author);
    }
  };

  _handleOnContentPress = () => {
    const { handleOnContentPress, content } = this.props;

    handleOnContentPress(content.author, content.permlink);
  };

  _handleOnVotersPress = () => {
    const { handleOnVotersPress, content } = this.props;

    handleOnVotersPress(content.active_votes);
  };

  render() {
    const { content, isLoggedIn, user } = this.props;

    // TODO: Should seperate bunch of component REFACTOR ME!
    return (
      <Card style={styles.post}>
        <CardItem style={styles.header}>
          <Left>
            <PostHeaderDescription
              date={content.created}
              profileOnPress={this._handleOnUserPress}
              name={content.author}
              reputation={content.author_reputation}
              tag={content.category}
              avatar={content && content.avatar}
              size={32}
            />
          </Left>
          <Right>
            <Icon name="md-more" />
          </Right>
        </CardItem>
        <TouchableOpacity onPress={() => this._handleOnContentPress()}>
          <Image
            source={{ uri: content && content.image }}
            defaultSource={require('../../../assets/no_image.png')}
            style={styles.image}
          />
          <CardItem>
            <Body>
              <Text style={styles.title}>{content.title}</Text>
              <Text style={styles.summary}>{content.summary}</Text>
            </Body>
          </CardItem>
        </TouchableOpacity>
        <CardItem>
          <Left>
            <Upvote content={content} user={user} isLoggedIn={!!user} />
            <TouchableOpacity
              onPress={() => this._handleOnVotersPress()}
              style={styles.payoutButton}
            >
              <Text style={styles.payout}>
$
                {content.pending_payout_value}
              </Text>
              <Icon name="md-arrow-dropdown" style={styles.payoutIcon} />
            </TouchableOpacity>
          </Left>
          <Right>
            <TouchableOpacity start style={styles.commentButton}>
              <Icon style={styles.commentIcon} active name="ios-chatbubbles-outline" />
              <Text style={styles.comment}>{content.children}</Text>
            </TouchableOpacity>
          </Right>
        </CardItem>
        {content.top_likers ? (
          <TouchableOpacity
            onPress={() => this._handleOnVotersPress()}
          >
            <CardItem style={styles.topLikers}>
              <Thumbnail
                source={{
                  uri: `https://steemitimages.com/u/${content.top_likers[0]}/avatar/small`,
                }}
                style={styles.likers_1}
              />
              <Thumbnail
                source={{
                  uri: `https://steemitimages.com/u/${content.top_likers[1]}/avatar/small`,
                }}
                style={styles.likers_2}
              />
              <Thumbnail
                source={{
                  uri: `https://steemitimages.com/u/${content.top_likers[2]}/avatar/small`,
                }}
                style={styles.likers_3}
              />
              <Text style={styles.footer}>
                @
                {content.top_likers[0]}
  , @
                {content.top_likers[1]}
  , @
                {content.top_likers[2]}
                <Text style={styles.footer}> & </Text>
                {content.vote_count - content.top_likers.length}
                {' '}
  others like this
              </Text>
            </CardItem>
          </TouchableOpacity>

        ) : (
          <CardItem>
            <Text style={styles.footer}>
              {content.vote_count}
              {' '}
likes
            </Text>
          </CardItem>
        )}
      </Card>
    );
  }
}

export default PostCard;
