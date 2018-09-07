/* eslint-disable no-unused-vars */
import React from "react";
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from "react-native";
import {
    Card,
    CardItem,
    Left,
    Right,
    Thumbnail,
    View,
    Icon,
    Body,
    Text,
} from "native-base";
import { Navigation } from "react-native-navigation";

import Modal from "react-native-modal";
import { Popover, PopoverController } from "react-native-modal-popover";
import Slider from "react-native-slider";

// STEEM
import { upvote, upvoteAmount } from "../../providers/steem/dsteem";
import { decryptKey } from "../../utils/crypto";
import { getUserData } from "../../realm/realm";
/* eslint-enable no-unused-vars */

class PostCard extends React.PureComponent {
    constructor(props) {
        super(props);
        this.upvoteContent = this.upvoteContent.bind(this);
        this.calculateEstimatedAmount = this.calculateEstimatedAmount.bind(
            this
        );

        this.state = {
            value: 0.0,
            isVoting: false,
            isVoted: this.props.content.isVoted,
            amount: "0.00",
            isModalVisible: false,
        };
    }

    componentDidMount() {
        if (this.props.isLoggedIn == true) {
            this.calculateEstimatedAmount();
        }
    }

    calculateEstimatedAmount = async () => {
        // Calculate total vesting shares
        let total_vests =
            parseFloat(this.props.user.vesting_shares) +
            parseFloat(this.props.user.received_vesting_shares) -
            parseFloat(this.props.user.delegated_vesting_shares);

        let final_vest = total_vests * 1e6;

        let power =
            (this.props.user.voting_power * (this.state.value * 10000)) /
            10000 /
            50;

        let rshares = (power * final_vest) / 10000;

        let estimated = await upvoteAmount(rshares);

        this.setState({
            amount: estimated.toFixed(3),
        });
    };

    upvoteContent = async () => {
        let postingKey;
        let userData;

        if (this.props.isLoggedIn) {
            await this.setState({
                isVoting: true,
            });

            await getUserData().then(result => {
                userData = Array.from(result);
                postingKey = decryptKey(userData[0].postingKey, "pinCode");
            });
            upvote(
                {
                    voter: this.props.user.name,
                    author: this.props.content.author,
                    permlink: this.props.content.permlink,
                    weight: (this.state.value * 100).toFixed(0) * 100,
                },
                postingKey
            )
                .then(res => {
                    console.log(res);
                    this.setState({
                        isVoted: true,
                        isVoting: false,
                    });
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        isVoted: false,
                        isVoting: false,
                    });
                });
        }
    };

    toggleModal = () => {
        this.setState({
            isModalVisible: !this.state.isModalVisible,
        });
    };

    render() {
        return (
            <Card style={styles.post}>
                <CardItem style={styles.header}>
                    <Left>
                        <TouchableOpacity
                            onPress={() =>
                                Navigation.push("tab1Stack", {
                                    component: {
                                        name: "navigation.eSteem.Author",
                                        passProps: {
                                            author: this.props.content.author,
                                            isLoggedIn: this.props.isLoggedIn,
                                            user: this.props.user,
                                        },
                                        options: {
                                            topBar: {},
                                        },
                                    },
                                })
                            }
                        >
                            <Thumbnail
                                style={styles.avatar}
                                source={{ uri: this.props.content.avatar }}
                            />
                        </TouchableOpacity>
                        <Body style={styles.body}>
                            <View style={styles.author}>
                                <Text style={styles.authorName}>
                                    {this.props.content.author}
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.text}>
                                    {this.props.content.author_reputation}
                                </Text>
                            </View>
                            <View style={styles.category}>
                                <Text style={styles.categoryText}>
                                    {this.props.content.category}
                                </Text>
                            </View>
                            <Text style={styles.timeAgo} note>
                                {" "}
                                {this.props.content.created}{" "}
                            </Text>
                        </Body>
                    </Left>
                    <Right>
                        <Icon name="md-more" />
                    </Right>
                </CardItem>
                <Image
                    source={{ uri: this.props.content.image }}
                    defaultSource={require("../../assets/no_image.png")}
                    style={styles.image}
                />
                <TouchableOpacity
                    onPress={() =>
                        Navigation.push("tab1Stack", {
                            component: {
                                name: "navigation.eSteem.Post",
                                passProps: {
                                    content: this.props.content,
                                    isLoggedIn: this.props.isLoggedIn,
                                    user: this.props.user,
                                },
                                options: {
                                    topBar: {},
                                },
                            },
                        })
                    }
                >
                    <CardItem>
                        <Body>
                            <Text style={styles.title}>
                                {this.props.content.title}
                            </Text>
                            <Text style={styles.summary}>
                                {this.props.content.summary}
                            </Text>
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
                                        {this.state.isVoting ? (
                                            <ActivityIndicator />
                                        ) : (
                                            <View>
                                                {this.state.isVoted ? (
                                                    <Icon
                                                        style={{
                                                            color: "#007ee5",
                                                        }}
                                                        style={
                                                            styles.upvoteIcon
                                                        }
                                                        active
                                                        name="ios-arrow-dropup-circle"
                                                    />
                                                ) : (
                                                    <Icon
                                                        style={{
                                                            color: "#007ee5",
                                                        }}
                                                        style={
                                                            styles.upvoteIcon
                                                        }
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
                                        placement={"top"}
                                        supportedOrientations={[
                                            "portrait",
                                            "landscape",
                                        ]}
                                    >
                                        <Text>${this.state.amount}</Text>
                                        <View
                                            style={{
                                                flex: 1,
                                                flexDirection: "row",
                                            }}
                                        >
                                            <TouchableOpacity
                                                onPress={() => {
                                                    closePopover();
                                                    this.upvoteContent();
                                                }}
                                                style={{
                                                    flex: 0.1,
                                                    alignSelf: "center",
                                                }}
                                            >
                                                <Icon
                                                    style={{ color: "#007ee5" }}
                                                    active
                                                    name="ios-arrow-dropup-outline"
                                                />
                                            </TouchableOpacity>
                                            <Slider
                                                style={{ flex: 0.75 }}
                                                minimumTrackTintColor="#13a9d6"
                                                trackStyle={styles.track}
                                                thumbStyle={styles.thumb}
                                                thumbTintColor="#007ee5"
                                                value={this.state.value}
                                                onValueChange={value => {
                                                    this.setState(
                                                        { value },
                                                        () => {
                                                            this.calculateEstimatedAmount();
                                                        }
                                                    );
                                                }}
                                            />
                                            <Text
                                                style={{
                                                    flex: 0.15,
                                                    alignSelf: "center",
                                                    marginLeft: 10,
                                                }}
                                            >
                                                {(
                                                    this.state.value * 100
                                                ).toFixed(0)}
                                                %
                                            </Text>
                                        </View>
                                    </Popover>
                                </React.Fragment>
                            )}
                        </PopoverController>
                        <TouchableOpacity
                            onPress={this.toggleModal}
                            style={styles.payoutButton}
                        >
                            <Text style={styles.payout}>
                                ${this.props.content.pending_payout_value}
                            </Text>
                            <Icon
                                name="md-arrow-dropdown"
                                style={styles.payoutIcon}
                            />
                            <Modal isVisible={this.state.isModalVisible}>
                                <View
                                    style={{
                                        flex: 0.8,
                                        backgroundColor: "white",
                                        borderRadius: 10,
                                    }}
                                >
                                    <TouchableOpacity
                                        onPress={this.toggleModal}
                                    >
                                        <Text>Tap to close!</Text>
                                    </TouchableOpacity>
                                    <FlatList
                                        data={this.props.content.active_votes}
                                        keyExtractor={item =>
                                            item.voter.toString()
                                        }
                                        renderItem={({ item }) => (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    borderColor: "lightgray",
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
                                                    {" "}
                                                    {item.voter} (
                                                    {item.reputation})
                                                </Text>
                                                <Text style={{ flex: 0.2 }}>
                                                    {item.value}$
                                                </Text>
                                                <Text style={{ flex: 0.2 }}>
                                                    {item.percent}%
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
                            <Icon
                                style={styles.commentIcon}
                                active
                                name="ios-chatbubbles-outline"
                            />
                            <Text style={styles.comment}>
                                {this.props.content.children}
                            </Text>
                        </TouchableOpacity>
                    </Right>
                </CardItem>
                {this.props.content.top_likers ? (
                    <CardItem style={styles.topLikers}>
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[0]
                                }/avatar/small`,
                            }}
                            style={styles.likers_1}
                        />
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[1]
                                }/avatar/small`,
                            }}
                            style={styles.likers_2}
                        />
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[2]
                                }/avatar/small`,
                            }}
                            style={styles.likers_3}
                        />
                        <Text style={styles.footer}>
                            @{this.props.content.top_likers[0]}, @
                            {this.props.content.top_likers[1]}, @
                            {this.props.content.top_likers[2]}
                            <Text style={styles.footer}> & </Text>
                            {this.props.content.vote_count -
                                this.props.content.top_likers.length}{" "}
                            others like this
                        </Text>
                    </CardItem>
                ) : (
                    <CardItem>
                        <Text style={styles.footer}>
                            {this.props.content.vote_count} likes
                        </Text>
                    </CardItem>
                )}
            </Card>
        );
    }
}
const styles = StyleSheet.create({
    post: {
        shadowColor: "white",
        padding: 0,
        marginRight: 0,
        marginLeft: 0,
        marginTop: 10,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        borderRadius: 5,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: "lightgray",
        borderWidth: 1,
    },
    author: {
        backgroundColor: "white",
        alignSelf: "flex-start",
        paddingVertical: 5,
    },
    timeAgo: {
        alignSelf: "center",
        fontSize: 9,
        fontWeight: "100",
        marginHorizontal: 3,
    },
    authorName: {
        color: "#222",
        fontWeight: "600",
        fontSize: 10,
    },
    upvoteButton: {
        margin: 0,
        flexDirection: "row",
        paddingVertical: 0,
    },
    upvoteIcon: {
        alignSelf: "flex-start",
        fontSize: 20,
        color: "#007ee5",
        margin: 0,
        width: 18,
    },
    payout: {
        alignSelf: "center",
        fontSize: 10,
        color: "#626262",
        marginLeft: 3,
    },
    payoutIcon: {
        fontSize: 15,
        marginHorizontal: 3,
        color: "#a0a0a0",
        alignSelf: "center",
    },
    payoutButton: {
        flexDirection: "row",
        alignSelf: "flex-start",
        paddingVertical: 2,
    },
    commentButton: {
        padding: 0,
        margin: 0,
        flexDirection: "row",
    },
    comment: {
        alignSelf: "center",
        fontSize: 10,
        color: "#626262",
        marginLeft: 3,
    },
    commentIcon: {
        alignSelf: "flex-start",
        fontSize: 20,
        color: "#007ee5",
        margin: 0,
        width: 20,
    },
    title: {
        fontSize: 12,
        fontWeight: "500",
        marginVertical: 5,
    },
    summary: {
        fontSize: 10,
        fontWeight: "200",
        overflow: "hidden",
    },
    header: {
        shadowColor: "white",
        height: 50,
        borderRadius: 5,
    },
    body: {
        justifyContent: "flex-start",
        flexDirection: "row",
    },
    image: {
        margin: 0,
        width: "100%",
        height: 160,
    },
    badge: {
        alignSelf: "center",
        borderColor: "lightgray",
        borderWidth: 1,
        borderRadius: 10,
        width: 15,
        height: 15,
        padding: 2,
        backgroundColor: "lightgray",
        marginHorizontal: 5,
    },
    category: {
        alignSelf: "center",
        borderRadius: 10,
        height: 15,
        backgroundColor: "#007EE5",
        paddingHorizontal: 5,
        paddingVertical: 1.5,
    },
    categoryText: {
        fontSize: 9,
        color: "white",
        fontWeight: "600",
    },
    text: {
        fontSize: 7,
        alignSelf: "center",
        textAlignVertical: "center",
        color: "white",
        fontWeight: "bold",
    },
    topLikers: {
        shadowColor: "white",
        backgroundColor: "#f8f8f8",
        borderWidth: 0,
        padding: 0,
        borderRadius: 5,
    },
    likers_1: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: "lightgray",
        marginVertical: -5,
    },
    likers_2: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: "lightgray",
        marginVertical: -5,
        marginLeft: -3,
    },
    likers_3: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: "lightgray",
        marginVertical: -5,
        marginLeft: -3,
    },
    footer: {
        shadowColor: "white",
        paddingLeft: 5,
        borderRadius: 5,
        fontSize: 7,
        fontWeight: "100",
        color: "#777777",
    },
    popover: {
        width: Dimensions.get("window").width - 20,
        borderRadius: 5,
        padding: 10,
    },
    track: {
        height: 2,
        borderRadius: 1,
    },
    thumb: {
        width: 30,
        height: 30,
        borderRadius: 30 / 2,
        backgroundColor: "white",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 2,
        shadowOpacity: 0.35,
    },
});

export default PostCard;
