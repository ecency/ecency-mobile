import React, { Component } from "react";
import {
    Text,
    View,
    Dimensions,
    TextInput,
    FlatList,
    Image,
    ActivityIndicator,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Navigation } from "react-native-navigation";
import { lookupAccounts } from "../../providers/steem/dsteem";
import { SEARCH_API_TOKEN } from "../../../config";

export default class Search extends Component {
    constructor() {
        super();
        this.handleSearch = this.handleSearch.bind(this);
        this.state = {
            text: "",
            scroll_id: "",
            posts: [],
            users: [],
            loading: false,
        };
    }

    closeSearch = () => {
        Navigation.dismissOverlay(this.props.componentId);
    };

    handleSearch = async text => {
        if (text.length < 3) return;
        let users;
        let posts;
        let scroll_id;

        await this.setState({
            loading: true,
            text: text 
        });

        users = await lookupAccounts(text);

        await this.setState({ users: users });

        let data = { q: text };
        await fetch("https://api.search.esteem.app/search", {
            method: "POST",
            headers: {
                // TODO: Create a config file for authorization

                Authorization: SEARCH_API_TOKEN,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then(result => result.json())
            .then(result => {
                posts = result.results;
                scroll_id = result.scroll_id;
            })
            .catch(error => {
                console.log(error);
            });

        await this.setState({ loading: false });

        await this.setState({
            posts: posts,
            scroll_id: scroll_id,
        });
    };

    render() {
        return (
            <View
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.8)",
                    height: Dimensions.get("window").height,
                    paddingTop: 25,
                    flex: 1
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        borderRadius: 8,
                        backgroundColor: "#f5f5f5",
                        paddingLeft: 10,
                        marginHorizontal: 10,
                    }}
                >
                    <Ionicons
                        name="md-search"
                        style={{
                            flex: 0.1,
                            fontSize: 18,
                            top: 10,
                            color: "#788187",
                        }}
                    />

                    <TextInput
                        style={{ flex: 0.9, height: 40 }}
                        autoCapitalize="none"
                        onChangeText={text => this.handleSearch(text)}
                        value={this.state.text}
                    />

                    <Ionicons
                        onPress={this.closeSearch}
                        name="md-close-circle"
                        style={{
                            flex: 0.1,
                            fontSize: 15,
                            top: 12.5,
                            color: "#c1c5c7",
                        }}
                    />
                </View>

                <View
                    style={{
                        paddingTop: 20,
                        flex: 1,
                        marginTop: 20,
                    }}
                >
                    <FlatList
                        data={this.state.users}
                        showsVerticalScrollIndicator={false}
                        horizontal={true}
                        renderItem={({ item }) => (
                            <View
                                style={{ margin: 10, flexDirection: "column" }}
                            >
                                <Image
                                    style={{
                                        width: 50,
                                        height: 50,
                                        borderRadius: 25,
                                        borderWidth: 1,
                                        borderColor: "gray",
                                    }}
                                    source={{
                                        uri: `https://steemitimages.com/u/${item}/avatar/small`,
                                    }}
                                />
                                <Text
                                    style={{
                                        color: "#fff",
                                        fontWeight: "500",
                                        fontSize: 10,
                                        overflow: "scroll",
                                    }}
                                >
                                    @{item}
                                </Text>
                            </View>
                        )}
                        keyExtractor={(post, index) => index.toString()}
                        removeClippedSubviews={true}
                        onEndThreshold={0}
                    />

                    <FlatList
                        data={this.state.posts}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            //  TODO: Create a component to list search results
                            <View
                                style={{
                                    backgroundColor: "white",
                                    borderRadius: 5,
                                    marginHorizontal: 10,
                                    marginVertical: 5,
                                }}
                            >
                                <View
                                    style={{
                                        flexDirection: "row",
                                    }}
                                >
                                    <Image
                                        source={{
                                            uri: `https://steemitimages.com/u/${
                                                item.author
                                            }/avatar/small`,
                                        }}
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            borderWidth: 1,
                                            borderColor: "gray",
                                        }}
                                    />
                                    <Text>
                                        {item.author} ({item.author_rep})
                                    </Text>
                                </View>
                            </View>
                        )}
                        keyExtractor={(post, index) => index.toString()}
                        removeClippedSubviews={true}
                        onEndThreshold={0}
                        initialNumToRender={20}
                    />
                </View>
            </View>
        );
    }
}
