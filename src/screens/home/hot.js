/* eslint-disable no-unused-vars */
import React from 'react';
import {
    StyleSheet,
    FlatList,
    View,
    StatusBar,
    ActivityIndicator,
} from 'react-native';

// STEEM
import { getPosts } from '../../providers/steem/Dsteem';

// LIBRARIES
import Placeholder from 'rn-placeholder';

// COMPONENTS
import PostCard from '../../components/post-card/PostCard';

// SCREENS
import PostPage from '../../screens/single-post/Post';
/* eslint-enable no-unused-vars */

class HotPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            posts: [],
            user: [],
            start_author: '',
            start_permlink: '',
            refreshing: false,
            loading: false,
        };
    }

    componentDidMount() {
        this.getHotPosts();
    }

    getHotPosts = () => {
        getPosts('hot', { tag: '', limit: 5 })
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
        getPosts('hot', {
            tag: '',
            limit: 10,
            start_author: this.state.start_author,
            start_permlink: this.state.start_permlink,
        }).then(result => {
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
            <View
                style={{
                    alignContent: 'center',
                    alignItems: 'center',
                    marginTop: 10,
                    borderColor: '#CED0CE',
                }}
            >
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
                            <View style={styles.card}>
                                <PostCard
                                    navigation={this.props.navigation}
                                    content={item}
                                />
                            </View>
                        )}
                        keyExtractor={(post, index) => index.toString()}
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

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9F9F9',
        flex: 1,
        top: StatusBar.currentHeight,
    },
    placeholder: {
        backgroundColor: 'white',
        padding: 20,
        borderStyle: 'solid',
        borderWidth: 1,
        borderTopWidth: 1,
        borderColor: '#e2e5e8',
        borderRadius: 0,
        marginRight: 0,
        marginLeft: 0,
        marginTop: 10,
    },
    card: {
        backgroundColor: 'white',
        shadowColor: 'white',
        marginRight: 0,
        marginLeft: 0,
        marginTop: 10,
        marginBottom: 0,
        borderWidth: 1,
        borderColor: '#e7eaec',
        borderRadius: 5,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
});

export default HotPage;
