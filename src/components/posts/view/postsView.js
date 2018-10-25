import React, { Component, Fragment } from 'react';
import {
  FlatList, View, ActivityIndicator, AppState,
} from 'react-native';

// import Placeholder from 'rn-placeholder';

// STEEM
import { getPosts } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostPlaceHolder } from '../../basicUIElements';
import { NoPost } from '../../basicUIElements';

// Styles
import styles from './postsStyles';

class PostsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
      user: props.user || null,
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
    const { getFor, tag } = this.props;
    const { user } = this.state;

    if (user) {
      getPosts(getFor, { tag, limit: 10 }, user)
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
    }
  };

  _loadMore = () => {
    const {
      posts, startAuthor, startPermlink, user,
    } = this.state;
    const { getFor, tag } = this.props;

    this.setState({ isLoading: true });

    getPosts(
      getFor,
      {
        tag,
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
        startAuthor: result && result[result.length - 1] && result[result.length - 1].author,
        startPermlink: result && result[result.length - 1] && result[result.length - 1].permlink,
      });
    });
  };

  _handleOnRefreshPosts = () => {
    this.setState(
      {
        refreshing: true,
      },
      () => {
        this._loadPosts();
      },
    );
  };

  _renderFooter = () => {
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

  _getRenderItem = () => {
    const {
      isReady, refreshing, posts, user,
    } = this.state;
    const { componentId, handleOnUserPress, filterOptions } = this.props;

    if (isReady && user) {
      return (
        <Fragment>
          {filterOptions && (
            <FilterBar
              dropdownIconName="md-arrow-dropdown"
              options={filterOptions}
              defaultText="NEW POST"
              rightIconName="md-apps"
            />
          )}
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard
                componentId={componentId}
                content={item}
                user={user}
                isLoggedIn
                handleOnUserPress={handleOnUserPress}
              />
            )}
            keyExtractor={(post, index) => index.toString()}
            onEndReached={this._loadMore}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={() => this._handleOnRefreshPosts()}
            onEndThreshold={0}
            initialNumToRender={10}
            ListFooterComponent={this._renderFooter}
          />
        </Fragment>
      );
    }

    if (!posts && posts.length < 1) {
      return (
        <Fragment>
          <NoPost
            name={user.name}
            text={"haven't posted anything yet"}
            defaultText="Login to see!"
          />
        </Fragment>
      );
    }

    return (
      <Fragment>
        <PostPlaceHolder />
        <PostPlaceHolder />
      </Fragment>
    );
  };

  render() {
    return <View>{this._getRenderItem()}</View>;
  }
}

export default PostsView;
