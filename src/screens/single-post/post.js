/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import React from "react";
import {
    Dimensions,
    ActivityIndicator,
    StatusBar,
    FlatList,
    BackHandler,
    ScrollView,
    TextInput,
    Image,
    View,
} from "react-native";
import { Card, Button, Icon, Text, Title } from "native-base";
import HTML from "react-native-html-renderer";

import styles from "../../styles/post.styles";
import { Navigation } from "react-native-navigation";
/* eslint-enable no-unused-vars */

class SinglePostPage extends React.Component {
    static get options() {
        return {
            _statusBar: {
                visible: true,
                drawBehind: false,
            },
            topBar: {
                animate: true,
                hideOnScroll: false,
                drawBehind: false,
                leftButtons: {
                    id: "back",
                },
            },
            layout: {
                backgroundColor: "#f5fcff",
            },
            bottomTabs: {
                visible: false,
                drawBehind: true,
            },
        };
    }

    constructor(props) {
        super(props);
        Navigation.events().bindComponent(this);
        this.state = {
            comments: [],
            comment: "",
            isLoading: false,
        };
    }

    componentDidMount() {
        BackHandler.addEventListener("hardwareBackPress", () => {
            Navigation.pop(this.props.componentId);
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress");
    }

    onLinkPress(evt, href, attribs) {}

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

    navigationButtonPressed({ buttonId }) {
        // will be called when "buttonOne" is clicked
        if (buttonId === "back") {
            Navigation.pop(this.props.componentId);
        }
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <ScrollView style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row" }}>
                        <View style={{ flex: 0.2 }}>
                            <Image
                                style={{
                                    height: 40,
                                    width: 40,
                                    borderWidth: 1,
                                    borderColor: "lightgray",
                                }}
                                source={{
                                    uri: this.props.content.avatar,
                                }}
                            />
                        </View>
                        <View style={{ flex: 0.4 }}>
                            <Text>{this.props.content.author}</Text>
                            <Text note>#{this.props.content.category}</Text>
                        </View>
                        <View style={{ flex: 0.4, alignItems: "flex-end" }}>
                            <Text note>{this.props.content.created}</Text>
                        </View>
                    </View>
                    <View>
                        <Text style={{ fontWeight: "bold" }}>
                            {this.props.content.title}
                        </Text>
                    </View>
                    <HTML
                        html={this.props.content.body}
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
                </ScrollView>
            </View>
        );
    }
}

export default SinglePostPage;
