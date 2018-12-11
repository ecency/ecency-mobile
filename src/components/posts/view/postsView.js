import React, { Component, Fragment } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { injectIntl } from 'react-intl';

// STEEM
import { getPostsSummary } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';

import filters from '../../../constants/options/filters.json';
// Styles
import styles from './postsStyles';

class PostsView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      startAuthor: '',
      startPermlink: '',
      refreshing: false,
      isLoading: false,
      isPostsLoading: false,
      isHideImage: false,
    };
  }

  componentDidMount() {
    this._loadPosts();
  }

  _loadPosts = (filter = null) => {
    const { getFor, tag, currentAccountUsername } = this.props;
    let options;

    if (!filter) {
      options = { tag, limit: 3 };
    } else {
      options = { limit: 3 };
    }

    getPostsSummary(filter || getFor, options, currentAccountUsername)
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
  };

  _loadMore = () => {
    // TODO: merge above function with this func (after alpha).
    const {
      posts, startAuthor, startPermlink,
    } = this.state;
    const { getFor, tag, currentAccountUsername } = this.props;

    this.setState({ isLoading: true });

    getPostsSummary(
      getFor,
      {
        tag,
        limit: 3,
        start_author: startAuthor,
        start_permlink: startPermlink,
      },
      currentAccountUsername,
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

  _handleOnDropdownSelect = (index) => {
    this.setState({ isPostsLoading: true });
    this._loadPosts(filters[index]);
  };

  _onRightIconPress = () => {
    const { isHideImage } = this.state;

    this.setState({ isHideImage: !isHideImage });
  };

  render() {
    const {
      refreshing, posts, isPostsLoading, isHideImage,
    } = this.state;
    const { filterOptions, intl } = this.props;

    return (
      <Fragment>
        {filterOptions && (
          <FilterBar
            dropdownIconName="md-arrow-dropdown"
            options={filterOptions}
            selectedOptionIndex={0}
            defaultText={filterOptions[0]}
            rightIconName="view-module"
            rightIconType="MaterialIcons"
            onDropdownSelect={this._handleOnDropdownSelect}
            onRightIconPress={this._onRightIconPress}
          />
        )}
        {posts && posts.length > 0 && !isPostsLoading ? (
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard content={item} isHideImage={isHideImage} />
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
            {/* TODO: fix here */}
            {/* {
              (posts.length <= 0 && (
                <NoPost
                  name={user.name}
                  text={intl.formatMessage({
                    id: 'profile.havent_posted',
                  })}
                  defaultText={intl.formatMessage({
                    id: 'profile.login_to_see',
                  })}
                />
              ))
              } */}
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </Fragment>
        )}
      </Fragment>
    );
  }
}

export default injectIntl(PostsView);
