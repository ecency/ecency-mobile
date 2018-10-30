import React, { Component, Fragment } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';

// import Placeholder from 'rn-placeholder';

// STEEM
import { getPosts } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';

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
    };
  }

  componentDidMount() {
    const { user, isLoggedIn, isLoginMust } = this.state;
    const isCanLoad = isLoginMust ? isLoggedIn : true;

    isCanLoad && this._loadPosts(user);
  }

  componentWillReceiveProps(nextProps) {
    const { user } = this.props;

    if (user !== nextProps.user) {
      this.setState({ user: nextProps.user });

      this._loadPosts(nextProps.user, nextProps.tag);
    }
  }

  _loadPosts = (user, _tag = null) => {
    const { getFor, tag } = this.props;
    const options = { tag: _tag || tag, limit: 10 };

    if (user) {
      getPosts(getFor, options, user)
        .then((result) => {
          if (result) {
            this.setState({
              isReady: true,
              posts: result,
              startAuthor: result[result.length - 1] && result[result.length - 1].author,
              startPermlink: result[result.length - 1] && result[result.length - 1].permlink,
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
    const { user } = this.state;

    this.setState(
      {
        refreshing: true,
      },
      () => {
        this._loadPosts(user);
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
    const {
      componentId,
      handleOnUserPress,
      filterOptions,
      isLoginMust,
      handleOnContentPress,
      isLoggedIn,
    } = this.props;

    if (user && posts && posts.length > 0) {
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
                isLoggedIn={isLoggedIn}
                handleOnUserPress={handleOnUserPress}
                handleOnContentPress={handleOnContentPress}
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

    if (isReady && !posts && posts.length < 1) {
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

    // if (isLoginMust && !isLoggedIn) {
    //   return <NoPost defaultText="Login to see!" />;
    // }

    return (
      <Fragment>
        <PostCardPlaceHolder />
        <PostCardPlaceHolder />
      </Fragment>
    );
  };

  render() {
    return <View>{this._getRenderItem()}</View>;
  }
}

export default PostsView;
