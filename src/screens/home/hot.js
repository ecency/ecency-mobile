/* eslint-disable no-unused-vars */
import React from "react";
import {
    StyleSheet,
    FlatList,
    View,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import styles from "../../styles/hot.styles";

// STEEM
import { getPosts } from "../../providers/steem/Dsteem";

// LIBRARIES
import Placeholder from "rn-placeholder";

// COMPONENTS
import PostCard from "../../components/post-card/PostCard";

// SCREENS
import PostPage from "../../screens/single-post/Post";
/* eslint-enable no-unused-vars */

class HotPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            posts: [],
            start_author: "",
            start_permlink: "",
            refreshing: false,
            loading: false,
            isLoggedIn: this.props.isLoggedIn,
        };
    }

    componentDidMount() {
        this.getHotPosts();
    }

    getHotPosts = () => {
        getPosts("hot", { tag: "", limit: 10 }, this.props.user.name)
            .then(result => {
                this.setState({
                    isReady: true,
                    posts: result,
                    start_author: result[result.length - 1].author,
                    start_permlink: result[result.length - 1].permlink,
                    refreshing: false,
                });
            })
            .catch(err => {
                alert(err);
            });
    };

    getMoreHot = () => {
        this.setState({ loading: true });
        getPosts(
            "hot",
            {
                tag: "",
                limit: 10,
                start_author: this.state.start_author,
                start_permlink: this.state.start_permlink,
            },
            this.props.user.name
        ).then(result => {
            let posts = result;
            posts.shift();
            this.setState({
                posts: [...this.state.posts, ...posts],
                start_author: result[result.length - 1].author,
                start_permlink: result[result.length - 1].permlink,
            });
        });
    };

    refreshHotPosts = () => {
        this.setState(
            {
                refreshing: true,
            },
            () => {
                this.getHotPosts();
            }
        );
    };

    renderFooter = () => {
        if (!this.state.loading) return null;

        return (
            <View style={styles.flatlistFooter}>
                <ActivityIndicator animating size="large" />
            </View>
        );
    };

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.isReady ? (
                    <FlatList
                        style={{ flex: 1 }}
                        data={this.state.posts}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <PostCard
                                navigation={this.props.navigation}
                                content={item}
                                user={this.props.user}
                                isLoggedIn={this.state.isLoggedIn}
                            />
                        )}
                        keyExtractor={post => post.id.toString()}
                        onEndReached={this.getMoreHot}
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.refreshHotPosts()}
                        onEndThreshold={0}
                        ListFooterComponent={this.renderFooter}
                    />
                ) : (
                    <View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                        <View style={styles.placeholder}>
                            <Placeholder.ImageContent
                                size={60}
                                animate="fade"
                                lineNumber={4}
                                lineSpacing={5}
                                lastLineWidth="30%"
                                onReady={this.state.isReady}
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

export default HotPage;
