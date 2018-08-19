/* eslint-disable no-unused-vars */
import React from "react";
import {
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ActivityIndicator,
    FlatList,
    TextInput,
} from "react-native";
import {
    Card,
    CardItem,
    Header,
    Left,
    Right,
    Thumbnail,
    Title,
    View,
    Icon,
    Body,
    Text,
    Button,
} from "native-base";
import { Popover, PopoverController } from "react-native-modal-popover";
import Slider from "react-native-slider";
import Modal from "react-native-modal";

import {
    upvote,
    upvoteAmount,
    postComment,
} from "../../providers/steem/Dsteem";
import { decryptKey } from "../../utils/Crypto";
import { getUserData } from "../../realm/Realm";
import { parsePost } from "../../utils/PostParser";
import { getComments, getPost } from "../../providers/steem/Dsteem";
/* eslint-enable no-unused-vars */

class Reply extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comment: "",
        };
    }

    componentDidMount() {
        console.log(this.props.navigation.state.params);
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
            <View style={{ backgroundColor: "white" }}>
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
                        <Text>Reply</Text>
                    </Body>
                    <Right />
                </Header>
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
                        placeholder={`Replying to @${
                            this.props.navigation.state.params.content.author
                        }`}
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
                                <Text>Submit</Text>
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
            </View>
        );
    }
}
const styles = StyleSheet.create({
    reply: {},
});

export default Reply;
