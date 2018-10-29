import React, { Component } from 'react';
import {
  Image, TouchableOpacity, FlatList,
} from 'react-native';
import {
  Card, CardItem, Left, Right, Thumbnail, View, Icon, Body, Text,
} from 'native-base';
import Modal from 'react-native-modal';

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

    this.state = {
      isModalVisible: false,
    };
  }

  // Component Lifecycle Functions

  // Component Functions

  toggleModal = () => {
    const { isModalVisible } = this.state;

    this.setState({
      isModalVisible: !isModalVisible,
    });
  };

  _handleOnUserPress = () => {
    const { handleOnUserPress, content, user } = this.props;

    if (handleOnUserPress && content && content.author !== user.name) {
      handleOnUserPress(content.author);
    }
  };

  render() {
    const {
      content, isLoggedIn, user,
    } = this.props;
    const { isModalVisible } = this.state;

    // TODO: Should seperate bunch of component REFACTOR ME!
    return (
      <Card style={styles.post}>
        <CardItem style={styles.header}>
          <Left>
            <TouchableOpacity onPress={() => this._handleOnUserPress()}>
              <Thumbnail style={styles.avatar} source={{ uri: content && content.avatar }} />
            </TouchableOpacity>
            <Body style={styles.body}>
              <View style={styles.author}>
                <TouchableOpacity
                  onPress={() => this._handleOnUserPress()}
                >
                  <Text style={styles.authorName}>{content.author}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.badge}>
                <Text style={styles.text}>{content.author_reputation}</Text>
              </View>
              <View style={styles.category}>
                <Text style={styles.categoryText}>{content.category}</Text>
              </View>
              <Text style={styles.timeAgo} note>
                {content.created}
              </Text>
            </Body>
          </Left>
          <Right>
            <Icon name="md-more" />
          </Right>
        </CardItem>
        <Image
          source={{ uri: content && content.image }}
          defaultSource={require('../../../assets/no_image.png')}
          style={styles.image}
        />
        <TouchableOpacity>
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
            <TouchableOpacity onPress={this.toggleModal} style={styles.payoutButton}>
              <Text style={styles.payout}>
$
                {content.pending_payout_value}
              </Text>
              <Icon name="md-arrow-dropdown" style={styles.payoutIcon} />
              <Modal isVisible={isModalVisible}>
                <View
                  style={{
                    flex: 0.8,
                    backgroundColor: 'white',
                    borderRadius: 10,
                  }}
                >
                  <TouchableOpacity onPress={this.toggleModal}>
                    <Text>Tap to close!</Text>
                  </TouchableOpacity>
                  <FlatList
                    data={content.active_votes}
                    keyExtractor={item => item.voter.toString()}
                    renderItem={({ item }) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          borderColor: 'lightgray',
                          borderWidth: 1,
                          borderRadius: 10,
                        }}
                      >
                        <Thumbnail
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            flex: 0.1,
                          }}
                          source={{
                            uri: item.avatar,
                          }}
                        />
                        <Text style={{ flex: 0.5 }}>
                          {item.voter}
(
                          {item.reputation}
)
                        </Text>
                        <Text style={{ flex: 0.2 }}>
                          {item.value}
$
                        </Text>
                        <Text style={{ flex: 0.2 }}>
                          {item.percent}
%
                        </Text>
                      </View>
                    )}
                  />
                </View>
              </Modal>
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
