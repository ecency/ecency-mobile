import React, { Component } from 'react';
import {
  Image, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import {
  Card, CardItem, Left, Right, Thumbnail, View, Icon, Body, Text,
} from 'native-base';
import Modal from 'react-native-modal';
import { Popover, PopoverController } from 'react-native-modal-popover';
import Slider from 'react-native-slider';

// STEEM
import { upvote, upvoteAmount } from '../../../providers/steem/dsteem';
import { decryptKey } from '../../../utils/crypto';
import { getUserData } from '../../../realm/realm';

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
    this.calculateEstimatedAmount = this.calculateEstimatedAmount.bind(this);

    this.state = {
      value: 0.0,
      isVoting: false,
      isVoted: props.content && props.content.isVoted,
      amount: '0.00',
      isModalVisible: false,
    };
  }

  // Component Lifecycle Functions
  componentDidMount() {
    const { isLoggedIn } = this.props;

    true && this.calculateEstimatedAmount();
  }

  // Component Functions
  calculateEstimatedAmount = async () => {
    const { user } = this.props;
    const { value } = this.state;
    // Calculate total vesting shares
    const total_vests = parseFloat(user.vesting_shares)
      + parseFloat(user.received_vesting_shares)
      - parseFloat(user.delegated_vesting_shares);

    const final_vest = total_vests * 1e6;

    const power = (user.voting_power * (value * 10000)) / 10000 / 50;

    const rshares = (power * final_vest) / 10000;

    const estimated = await upvoteAmount(rshares);

    this.setState({
      amount: estimated.toFixed(3),
    });
  };

  upvoteContent = async () => {
    alert("ugur");
    const { isLoggedIn, user, content } = this.props;
    const { value } = this.state;

    let postingKey;
    let userData;

    if (true) {
      await this.setState({
        isVoting: true,
      });

      await getUserData().then((result) => {
        userData = Array.from(result);
        postingKey = decryptKey(userData[0].postingKey, '1234');
      });
      upvote(
        {
          voter: user && user.name,
          author: content && content.author,
          permlink: content && content.permlink,
          weight: (value * 100).toFixed(0) * 100,
        },
        postingKey,
      )
        .then((res) => {
          console.log(res);
          this.setState({
            isVoted: true,
            isVoting: false,
          });
        })
        .catch((err) => {
          console.log(err);
          this.setState({
            isVoted: false,
            isVoting: false,
          });
        });
    }
  };

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
      content, isLoggedIn, user, handleOnUserPress,
    } = this.props;
    const {
      isVoted, isVoting, isModalVisible, value,
    } = this.state;

    // TODO: Should seperate bunch of component REFACTOR ME!
    return (
      <Card style={styles.post}>
        <CardItem style={styles.header}>
          <Left>
            <TouchableOpacity
              onPress={() => this._handleOnUserPress()}
            >
              <Thumbnail style={styles.avatar} source={{ uri: content && content.avatar }} />
            </TouchableOpacity>
            <Body style={styles.body}>
              <View style={styles.author}>
                <Text style={styles.authorName}>{content.author}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.text}>{content.author_reputation}</Text>
              </View>
              <View style={styles.category}>
                <Text style={styles.categoryText}>{content.category}</Text>
              </View>
              <Text style={styles.timeAgo} note>
                {' '}
                {content.created}
                {' '}
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
            <PopoverController>
              {({
                openPopover,
                closePopover,
                popoverVisible,
                setPopoverAnchor,
                popoverAnchorRect,
              }) => (
                <React.Fragment>
                  <TouchableOpacity
                    start
                    ref={setPopoverAnchor}
                    onPress={openPopover}
                    style={styles.upvoteButton}
                  >
                    {isVoting ? (
                      <ActivityIndicator />
                    ) : (
                      <View>
                        {isVoted ? (
                          <Icon
                            style={{
                              color: '#007ee5',
                            }}
                            style={styles.upvoteIcon}
                            active
                            name="ios-arrow-dropup-circle"
                          />
                        ) : (
                          <Icon
                            style={{
                              color: '#007ee5',
                            }}
                            style={styles.upvoteIcon}
                            active
                            name="ios-arrow-dropup-outline"
                          />
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                  <Popover
                    contentStyle={styles.popover}
                    arrowStyle={styles.arrow}
                    backgroundStyle={styles.background}
                    visible={popoverVisible}
                    onClose={closePopover}
                    fromRect={popoverAnchorRect}
                    placement="top"
                    supportedOrientations={['portrait', 'landscape']}
                  >
                    <Text>
$
                      {this.state.amount}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          closePopover();
                          this.upvoteContent();
                        }}
                        style={{
                          flex: 0.1,
                          alignSelf: 'center',
                        }}
                      >
                        <Icon style={{ color: '#007ee5' }} active name="ios-arrow-dropup-outline" />
                      </TouchableOpacity>
                      <Slider
                        style={{ flex: 0.75 }}
                        minimumTrackTintColor="#13a9d6"
                        trackStyle={styles.track}
                        thumbStyle={styles.thumb}
                        thumbTintColor="#007ee5"
                        value={value}
                        onValueChange={(value) => {
                          this.setState({ value }, () => {
                            this.calculateEstimatedAmount();
                          });
                        }}
                      />
                      <Text
                        style={{
                          flex: 0.15,
                          alignSelf: 'center',
                          marginLeft: 10,
                        }}
                      >
                        {(value * 100).toFixed(0)}
%
                      </Text>
                    </View>
                  </Popover>
                </React.Fragment>
              )}
            </PopoverController>
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
                    data={this.props.content.active_votes}
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
                          {' '}
                          {item.voter}
                          {' '}
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
