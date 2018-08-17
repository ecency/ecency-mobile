/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from "react";
import { Dimensions, StyleSheet, StatusBar, FlatList } from "react-native";
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
import HTML from "react-native-render-html";
import { Client } from "dsteem";
const client = new Client("https://api.steemit.com");

import { parsePost, protocolUrl2Obj } from "../../utils/PostParser";
import { getComments } from "../../providers/steem/Dsteem";
import Comment from "../../components/comment/Comment";
/* eslint-enable no-unused-vars */

class SinglePostPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: [],
        };
    }

    componentDidMount() {
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
            node.attribs.style = `max-width: ${Dimensions.get("window").width}`;
        } else if (node.name == "iframe") {
            node.attribs.style = `max-width: ${Dimensions.get("window").width}`;
            node.attribs.style = `width: ${Dimensions.get("window").width}`;
            node.attribs.height = 200;
        }
    }

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
                    <View style={{ flex: 1, backgroundColor: "white" }}>
                        <FlatList
                            style={{ backgroundColor: "white" }}
                            removeClippedSubviews={false}
                            data={this.state.comments}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <Comment
                                    comment={item}
                                    navigation={this.props.navigation}
                                />
                            )}
                            keyExtractor={item => item.permlink.toString()}
                        />
                    </View>
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    iframe: {
        maxWidth: Dimensions.get("window").width,
    },
    img: {
        maxWidth: Dimensions.get("window").width,
    },
});

export default SinglePostPage;
