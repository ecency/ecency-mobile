import React, { Component, Fragment } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';

// STEEM
import { getPostsSummary } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder } from '../../basicUIElements';
import filters from '../../../constants/options/filters.json';
// Styles
import styles from './postsStyles';

class PostsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: props.user || null,
      posts: [],
      startAuthor: '',
      startPermlink: '',
      refreshing: false,
      isLoading: false,
      isPostsLoading: false,
      isShowImages: true,
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

  _loadPosts = (user, _tag = null, _getFor = null) => {
    const { getFor, tag } = this.props;
    const { isShowImages } = this.state;
    let options;
    _getFor ? (options = { limit: 3 }) : (options = { tag: _tag || tag, limit: 3 });

    if (user) {
      getPostsSummary(_getFor || getFor, options, user, isShowImages)
        .then((result) => {
          if (result) {
            this.setState({
              posts: result,
              startAuthor: result[result.length - 1] && result[result.length - 1].author,
              startPermlink: result[result.length - 1] && result[result.length - 1].permlink,
              refreshing: false,
              isPostsLoading: false,
            });
          }
        })
        .catch((err) => {
          alert(err);
        });
    }
  };

  _loadMore = () => {
    // TODO: merge above function with this func (after alpha).
    const {
      posts, startAuthor, startPermlink, user, isShowImages,
    } = this.state;
    const { getFor, tag } = this.props;

    this.setState({ isLoading: true });

    getPostsSummary(
      getFor,
      {
        tag,
        limit: 3,
        start_author: startAuthor,
        start_permlink: startPermlink,
      },
      (user && user.name) || 'esteemapp',
      isShowImages,
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

  _handleOnDropdownSelect = (index) => {
    const { user } = this.state;
    this.setState({ isPostsLoading: true });
    this._loadPosts(user, null, filters[index]);
  };

  _onRightIconPress = () => {
    const { isShowImages } = this.state;

    this.setState({ isShowImages: !isShowImages });
  };

  render() {
    const {
      refreshing, posts, user, isPostsLoading, isShowImages,
    } = this.state;
    const { componentId, filterOptions, isLoggedIn } = this.props;

    return (
      <Fragment>
        {filterOptions && (
          <FilterBar
            dropdownIconName="md-arrow-dropdown"
            options={filterOptions}
            selectedOptionIndex={0}
            defaultText={filterOptions[0]}
            rightIconName="md-apps"
            onDropdownSelect={this._handleOnDropdownSelect}
            onRightIconPress={this._onRightIconPress}
          />
        )}
        {user && posts && posts.length > 0 && !isPostsLoading ? (
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard
                componentId={componentId}
                content={item}
                user={user}
                isLoggedIn={isLoggedIn}
                isShowImages={isShowImages}
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
        ) : (
          <Fragment>
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default PostsView;
