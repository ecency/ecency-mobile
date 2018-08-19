/* eslint-disable no-unused-vars */
import React from "react";
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    FlatList,
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
    Button,
} from "native-base";
import { Popover, PopoverController } from "react-native-modal-popover";
import Slider from "react-native-slider";
import Modal from "react-native-modal";
import HTML from "react-native-html-renderer";

import { upvote, upvoteAmount } from "../../providers/steem/Dsteem";
import { decryptKey } from "../../utils/Crypto";
import { getUserData } from "../../realm/Realm";
import { parsePost } from "../../utils/PostParser";
import { getComments, getPost } from "../../providers/steem/Dsteem";
/* eslint-enable no-unused-vars */

class Comment extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            amount: "0.00",
            value: 0.1,
            replies: [],
            isVoting: false,
            isVoted: false,
            isModalVisible: false,
        };
    }

    componentDidMount() {
        if (this.props.comment.children > 1) {
            getComments(this.props.comment.author, this.props.comment.permlink)
                .then(replies => {
                    this.setState({
                        replies: replies,
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        }
    }

    onLinkPress(evt, href, attribs) {
        let steemPost = href.match(
            /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i
        );

        if (attribs.class === "markdown-author-link") {
            this.props.navigation.navigate("Author", { author: href });
        } else if (steemPost != null) {
            steemPost[3] = steemPost[3].replace("@", "");
            getPost(steemPost[3], steemPost[4])
                .then(result => {
                    let content = parsePost(result);
                    this.props.navigation.push("Post", { content: content });
                })
                .catch(err => {
                    alert(err);
                });
        } else {
            console.log(href);
            console.log(attribs);
        }
    }

    alterNode(node) {
        if (node.name == "img") {
            node.attribs.style = "width: auto; object-fit: cover";
        } else if (node.name == "iframe") {
            node.attribs.style = `max-width: ${Dimensions.get("window").width}`;
            //node.attribs.style = `width: ${Dimensions.get("window").width}`;
            node.attribs.height = 200;
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
                    author: this.props.comment.author,
                    permlink: this.props.comment.permlink,
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
            <View>
                <View style={styles.comment}>
                    <Thumbnail
                        style={styles.avatar}
                        source={{
                            uri: `https://steemitimages.com/u/${
                                this.props.comment.author
                            }/avatar/small`,
                        }}
                    />
                    <Card style={styles.commentBox}>
                        <CardItem style={{ borderRadius: 10 }}>
                            <Left>
                                <View style={styles.author}>
                                    <Text style={styles.authorName}>
                                        {this.props.comment.author}
                                    </Text>
                                </View>
                            </Left>

                            <Text style={styles.timeAgo} note>
                                {this.props.comment.created}
                            </Text>
                        </CardItem>
                        <CardItem>
                            <HTML
                                html={this.props.comment.body}
                                onLinkPress={(evt, href, hrefatr) =>
                                    this.onLinkPress(evt, href, hrefatr)
                                }
                                containerStyle={{ padding: 0 }}
                                textSelectable={true}
                                tagsStyles={styles}
                                ignoredTags={["script"]}
                                debug={false}
                                removeClippedSubviews={false}
                                alterNode={node => {
                                    this.alterNode(node);
                                }}
                                imagesMaxWidth={Dimensions.get("window").width}
                            />
                        </CardItem>
                        <CardItem style={{ borderRadius: 10 }}>
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
                                                                    color:
                                                                        "#007ee5",
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
                                                                    color:
                                                                        "#007ee5",
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
                                                backgroundStyle={
                                                    styles.background
                                                }
                                                visible={popoverVisible}
                                                onClose={closePopover}
                                                fromRect={popoverAnchorRect}
                                                placement={"top"}
                                                supportedOrientations={[
                                                    "portrait",
                                                    "landscape",
                                                ]}
                                            >
                                                <Text>
                                                    ${this.state.amount}
                                                </Text>
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
                                                            style={{
                                                                color:
                                                                    "#007ee5",
                                                            }}
                                                            active
                                                            name="ios-arrow-dropup-outline"
                                                        />
                                                    </TouchableOpacity>
                                                    <Slider
                                                        style={{ flex: 1 }}
                                                        minimumTrackTintColor="#13a9d6"
                                                        trackStyle={
                                                            styles.track
                                                        }
                                                        thumbStyle={
                                                            styles.thumb
                                                        }
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
                                                            this.state.value *
                                                            100
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
                                        $
                                        {
                                            this.props.comment
                                                .pending_payout_value
                                        }
                                    </Text>
                                    <Icon
                                        name="md-arrow-dropdown"
                                        style={styles.payoutIcon}
                                    />
                                    <Modal
                                        isVisible={this.state.isModalVisible}
                                    >
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
                                                data={
                                                    this.props.comment
                                                        .active_votes
                                                }
                                                keyExtractor={item =>
                                                    item.voter.toString()
                                                }
                                                renderItem={({ item }) => (
                                                    <View
                                                        style={{
                                                            flexDirection:
                                                                "row",
                                                            borderColor:
                                                                "lightgray",
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
                                                                uri:
                                                                    item.avatar,
                                                            }}
                                                        />
                                                        <Text
                                                            style={{
                                                                flex: 0.5,
                                                            }}
                                                        >
                                                            {" "}
                                                            {item.voter} (
                                                            {item.reputation})
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                flex: 0.2,
                                                            }}
                                                        >
                                                            {item.value}$
                                                        </Text>
                                                        <Text
                                                            style={{
                                                                flex: 0.2,
                                                            }}
                                                        >
                                                            {item.percent}%
                                                        </Text>
                                                    </View>
                                                )}
                                            />
                                        </View>
                                    </Modal>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() =>
                                        this.props.navigation.navigate(
                                            "Reply",
                                            {
                                                content: this.props.comment,
                                                user: this.props.user,
                                            }
                                        )
                                    }
                                    style={{
                                        marginLeft: 10,
                                        flexDirection: "row",
                                    }}
                                >
                                    <Text style={{ fontSize: 10 }}>Reply</Text>
                                    <Icon
                                        style={{
                                            color: "#007ee5",
                                            fontSize: 15,
                                            left: 2,
                                        }}
                                        name={"redo"}
                                    />
                                </TouchableOpacity>
                            </Left>
                        </CardItem>
                    </Card>
                </View>

                {this.props.comment.children > 0 ? (
                    // Replies
                    <View>
                        {this.state.replies.map(reply => {
                            return (
                                <View style={{ paddingLeft: 30 }}>
                                    <Comment
                                        comment={reply}
                                        navigation={this.props.navigation}
                                        isLoggedIn={this.props.isLoggedIn}
                                        user={this.props.user}
                                    />
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View />
                )}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    comment: {
        alignSelf: "center",
        color: "#626262",
        borderRadius: 10,
        width: "98%",
        marginHorizontal: 10,
        flexDirection: "row",
    },
    commentBox: {
        borderRadius: 10,
        flex: 1,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: "lightgray",
        borderWidth: 1,
        marginTop: 10,
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
        fontSize: 13,
        marginHorizontal: 5,
    },
    body: {
        justifyContent: "flex-start",
        flexDirection: "row",
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

export default Comment;
