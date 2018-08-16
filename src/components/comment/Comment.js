/* eslint-disable no-unused-vars */
import React from "react";
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
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
    Button,
} from "native-base";
import { Popover, PopoverController } from "react-native-modal-popover";
import Slider from "react-native-slider";
import { upvote, upvoteAmount } from "../../providers/steem/Dsteem";
import { decryptKey } from "../../utils/Crypto";
import { getUserData } from "../../realm/Realm";
import { parsePost } from "../../utils/PostParser";
import { getComments, getPost } from "../../providers/steem/Dsteem";
import HTML from "react-native-render-html";
/* eslint-enable no-unused-vars */

class Comment extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            replies: [],
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
                    <Card style={{ flex: 0.91, borderRadius: 10 }}>
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
                                <Text>
                                    <Icon
                                        style={{ color: "blue" }}
                                        name="arrow-dropup"
                                    />
                                    {"$ "}
                                    {this.props.comment.pending_payout_value}
                                </Text>
                            </Left>
                            <Body>
                                <TouchableOpacity>
                                    <Text>
                                        <Icon
                                            style={{ color: "blue" }}
                                            name="ios-chatbubbles-outline"
                                        />
                                        Reply
                                    </Text>
                                </TouchableOpacity>
                            </Body>
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
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: "lightgray",
        borderWidth: 1,
        flex: 0.09,
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
});

export default Comment;
