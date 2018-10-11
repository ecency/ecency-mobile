import React, { Component } from 'react';
import {
  FlatList, View, ActivityIndicator, AppState,
} from 'react-native';

import Placeholder from 'rn-placeholder';

// STEEM
import { getPosts } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';

// Styles
import styles from './feedStyles';

class FeedView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      posts: [],
      startAuthor: '',
      startPermlink: '',
      refreshing: false,
      isLoading: false,
      appState: AppState.currentState,
    };
  }

  componentDidMount() {
    this._loadPosts();
    AppState.addEventListener('change', this._handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      alert('App has come to the foreground!');
    }
    this.setState({ appState: nextAppState });
  };

  _loadPosts = () => {
    const { user } = this.props;

    getPosts('feed', { tag: user.name, limit: 10 }, user.name)
      .then((result) => {
        if (result) {
          this.setState({
            isReady: true,
            posts: result,
            startAuthor: result[result.length - 1].author,
            startPermlink: result[result.length - 1].permlink,
            refreshing: false,
          });
        }
      })
      .catch((err) => {
        alert(err);
      });
  };

  _loadMore = () => {
    const { posts, startAuthor, startPermlink } = this.state;
    const { user } = this.props;

    this.setState({ isLoading: true });

    getPosts(
      'feed',
      {
        tag: user.name,
        limit: 10,
        start_author: startAuthor,
        start_permlink: startPermlink,
      },
      user.name,
    ).then((result) => {
      const _posts = result;
      _posts.shift();
      this.setState({
        posts: [...posts, ..._posts],
        startAuthor: result[result.length - 1].author,
        startPermlink: result[result.length - 1].permlink,
      });
    });
  };

  refreshPosts = () => {
    this.setState(
      {
        refreshing: true,
      },
      () => {
        this._loadPosts();
      },
    );
  };

  renderFooter = () => {
    const { isLoading } = this.state;

    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" />
        </View>
      );
    }
    return null;
  };

  render() {
    const { isReady, refreshing, posts } = this.state;
    const { componentId, user } = this.props;

    return (
      <View style={{ flex: 1 }}>
        {isReady && (
          <FilterBar
            dropdownIconName="md-arrow-dropdown"
            options={[
              'ALL NOTIFICATION',
              'LATEST NOTF',
              'ESTEEMAPP',
              'UGUR ERDAL',
              'ONLY YESTERDAY',
            ]}
            defaultText="NEW POST"
            rightIconName="md-apps"
          />
        )}
        {isReady ? (
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard componentId={componentId} content={item} user={user} isLoggedIn />
            )}
            keyExtractor={(post, index) => index.toString()}
            onEndReached={this._loadMore}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={() => this.refreshPosts()}
            onEndThreshold={0}
            initialNumToRender={10}
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
                onReady={isReady}
              />
            </View>
            <View style={styles.placeholder}>
              <Placeholder.ImageContent
                size={60}
                animate="fade"
                lineNumber={4}
                lineSpacing={5}
                lastLineWidth="30%"
                onReady={isReady}
              />
            </View>
            <View style={styles.placeholder}>
              <Placeholder.ImageContent
                size={60}
                animate="fade"
                lineNumber={4}
                lineSpacing={5}
                lastLineWidth="30%"
                onReady={isReady}
              />
            </View>
          </View>
        )}
      </View>
    );
  }
}

export default FeedView;
