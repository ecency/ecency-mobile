/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from "react";
import {
    Dimensions,
    ActivityIndicator,
    StatusBar,
    FlatList,
    TextInput,
} from "react-native";
import {
    Container,
    CardItem,
    Thumbnail,
    Content,
    Header,
    Card,
    View,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Text,
    Title,
} from "native-base";
import HTML from "react-native-html-renderer";
import { Client } from "dsteem";
const client = new Client("https://api.steemit.com");

import { parsePost, protocolUrl2Obj } from "../../utils/PostParser";
import { getComments, postComment } from "../../providers/steem/Dsteem";
import { decryptKey } from "../../utils/Crypto";
import { getUserData } from "../../realm/Realm";
import Comment from "../../components/comment/Comment";
import styles from "../../styles/post.styles";
/* eslint-enable no-unused-vars */

class SinglePostPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
            comment: "",
            isLoading: false,
        };
    }

    componentDidMount() {
        console.log(this.props.navigation.state.params);
        if (this.props.navigation.state.params.content.children > 0) {
            getComments(
                this.props.navigation.state.params.content.author,
                this.props.navigation.state.params.content.permlink
            )
                .then(replies => {
                    console.log(replies);
                    this.setState({
                        comments: replies,
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
            client.database
                .call("get_content", [steemPost[3], steemPost[4]])
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
            node.attribs.style = `max-width: ${Dimensions.get("window").width +
                10}px; left: -10px; width: 100% !important`;
        } else if (node.name == "iframe") {
            node.attribs.style = `max-width: ${
                Dimensions.get("window").width
            }px; left: -10px`;
            node.attribs.height = 200;
        }
    }

    postComment = async () => {
        this.setState({ isLoading: true });
        let content = this.props.navigation.state.params.content;
        let user = this.props.navigation.state.params.user;
        let userData;
        let postingKey;

        let comment = {
            parent_author: content.author,
            parent_permlink: content.permlink,
            author: user.name,
            permlink: this.commentPermlink(content.author, content.permlink),
            title: this.commentPermlink(content.author, content.permlink),
            body: this.state.comment,
            json_metadata: JSON.stringify({
                app: "eSteem",
                community: "eSteem",
            }),
        };

        await getUserData().then(result => {
            userData = Array.from(result);
            postingKey = decryptKey(userData[0].postingKey, "pinCode");
        });

        postComment(comment, postingKey)
            .then(result => {
                console.log(result);
                this.setState({
                    isLoading: false,
                    comment: "",
                });
            })
            .catch(error => {
                console.log(error);
                this.setState({ isLoading: false });
            });
    };

    /**
     * Method to format permlink for a comment
     * @param parent_author
     * @param parent_permlink
     */
    commentPermlink = (parent_author, parent_permlink) => {
        const timeStr = new Date()
            .toISOString()
            .replace(/[^a-zA-Z0-9]+/g, "")
            .toLocaleLowerCase();
        parent_permlink = parent_permlink.replace(/(-\d{8}t\d{9}z)/g, "");
        return "re" + parent_author + "-" + parent_permlink + "-" + timeStr;
    };

    render() {
        return (
            <Container style={{ top: StatusBar.currentHeight, flex: 1 }}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.pop()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title />
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="bookmark" />
                        </Button>
                        <Button transparent>
                            <Icon name="more" />
                        </Button>
                    </Right>
                </Header>
                <Content style={{ flex: 1 }}>
                    <CardItem style={{ flexDirection: "row" }}>
                        <View style={{ flex: 0.2 }}>
                            <Thumbnail
                                style={{
                                    borderWidth: 1,
                                    borderColor: "lightgray",
                                }}
                                source={{
                                    uri: this.props.navigation.state.params
                                        .content.avatar,
                                }}
                            />
                        </View>
                        <View style={{ flex: 0.4 }}>
                            <Text>
                                {
                                    this.props.navigation.state.params.content
                                        .author
                                }
                            </Text>
                            <Text note>
                                #
                                {
                                    this.props.navigation.state.params.content
                                        .category
                                }
                            </Text>
                        </View>
                        <View style={{ flex: 0.4, alignItems: "flex-end" }}>
                            <Text note>
                                {
                                    this.props.navigation.state.params.content
                                        .created
                                }
                            </Text>
                        </View>
                    </CardItem>
                    <CardItem>
                        <Text style={{ fontWeight: "bold" }}>
                            {this.props.navigation.state.params.content.title}
                        </Text>
                    </CardItem>
                    <HTML
                        html={this.props.navigation.state.params.content.body}
                        onLinkPress={(evt, href, hrefatr) =>
                            this.onLinkPress(evt, href, hrefatr)
                        }
                        containerStyle={{ padding: 10 }}
                        textSelectable={true}
                        tagsStyles={styles}
                        ignoredTags={["script"]}
                        debug={false}
                        alterNode={node => {
                            this.alterNode(node);
                        }}
                        imagesMaxWidth={Dimensions.get("window").width}
                    />
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <Left>
                            <Text>
                                {
                                    this.props.navigation.state.params.content
                                        .vote_count
                                }{" "}
                                Votes
                            </Text>
                        </Left>
                        <Body>
                            <Text>
                                {
                                    this.props.navigation.state.params.content
                                        .children
                                }{" "}
                                Comments
                            </Text>
                        </Body>
                        <Right>
                            <Text>
                                $
                                {
                                    this.props.navigation.state.params.content
                                        .pending_payout_value
                                }
                            </Text>
                        </Right>
                    </View>
                    <View style={{ padding: 10 }}>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                borderColor: "lightgray",
                                borderRadius: 5,
                                padding: 10,
                                minHeight: 100,
                            }}
                            multiline={true}
                            numberOfLines={4}
                            placeholder={"What do you think about this story?"}
                            onChangeText={comment => this.setState({ comment })}
                            value={this.state.comment}
                        />
                        <View style={{ flexDirection: "row-reverse" }}>
                            <Button
                                onPress={this.postComment}
                                style={{
                                    alignSelf: "flex-end",
                                    marginTop: 10,
                                    borderRadius: 20,
                                }}
                            >
                                {this.state.isLoading ? (
                                    <ActivityIndicator
                                        style={{ marginHorizontal: 50 }}
                                    />
                                ) : (
                                    <Text>Post a Comment</Text>
                                )}
                            </Button>
                            <Button
                                style={{
                                    alignSelf: "flex-end",
                                    marginRight: 10,
                                    borderRadius: 50,
                                }}
                            >
                                <Icon name={"images"} />
                            </Button>
                        </View>
                    </View>
                    <View style={styles.comments}>
                        {this.props.navigation.state.params.content.children >
                        0 ? (
                            <FlatList
                                style={{ backgroundColor: "white" }}
                                removeClippedSubviews={false}
                                data={this.state.comments}
                                showsVerticalScrollIndicator={false}
                                renderItem={({ item }) => (
                                    <Comment
                                        comment={item}
                                        navigation={this.props.navigation}
                                        isLoggedIn={
                                            this.props.navigation.state.params
                                                .isLoggedIn
                                        }
                                        user={
                                            this.props.navigation.state.params
                                                .user
                                        }
                                    />
                                )}
                                keyExtractor={item => item.id.toString()}
                            />
                        ) : (
                            <Card
                                style={{
                                    margin: 20,
                                    padding: 10,
                                    borderRadius: 10,
                                }}
                            >
                                <Text style={{ alignSelf: "center" }}>
                                    This post doesn't have any comment, yet!
                                </Text>
                            </Card>
                        )}
                    </View>
                </Content>
            </Container>
        );
    }
}

export default SinglePostPage;
