import React from 'react';
import {
    StyleSheet,
    FlatList,
    View,
    StatusBar,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import {
    Container,
    Header,
    Button,
    Thumbnail,
    Right,
    Text,
    Tabs,
    Tab,
    Icon,
    ScrollableTab,
} from 'native-base';

// STEEM
import { getPosts } from '../../providers/steem/Dsteem';

// LIBRARIES
import Placeholder from 'rn-placeholder';

// COMPONENTS
import PostCard from '../../components/post-card/PostCard';

/* eslint-enable no-unused-vars */

class FeedPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isReady: false,
            posts: [],
            start_author: '',
            start_permlink: '',
            refreshing: false,
            loading: false,
        };
    }

    componentWillMount() {
        this.getFeed();
    }

    getFeed = () => {
        getPosts('feed', { tag: this.props.user.name, limit: 5 })
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

    getMore = () => {
        this.setState({ loading: true });
        getPosts('feed', {
            tag: this.props.user.name,
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

    refreshPosts = () => {
        this.setState(
            {
                refreshing: true,
            },
            () => {
                this.getFeed();
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
                        onEndReached={this.getMore}
                        refreshing={this.state.refreshing}
                        onRefresh={() => this.refreshPosts()}
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
        borderColor: '#e2e5e8',
        borderRadius: 5,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    tabs: {
        position: 'absolute',
        top: Dimensions.get('window').width / 30,
        alignItems: 'center',
    },
});

export default FeedPage;
