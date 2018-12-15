import React, { Component, Fragment } from 'react';
import { FlatList, View, ActivityIndicator } from 'react-native';
import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

// STEEM
import { getPostsSummary } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';

import filters from '../../../constants/options/filters.json';
// Styles
import styles from './postsStyles';
import { default as ROUTES } from '../../../constants/routeNames';

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
      selectedFilterIndex: 0,
    };
  }

  componentDidMount() {
    this._loadPosts();
  }

  componentWillReceiveProps(nextProps) {
    const { currentAccountUsername } = this.props;

    if (
      currentAccountUsername !== nextProps.currentAccountUsername
      && nextProps.currentAccountUsername
    ) {
      this._loadPosts();
    }
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
    const { posts, startAuthor, startPermlink } = this.state;
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
      if (_posts.length > 0) {
        _posts.shift();
        this.setState({
          posts: [...posts, ..._posts],
          startAuthor: result && result[result.length - 1] && result[result.length - 1].author,
          startPermlink: result && result[result.length - 1] && result[result.length - 1].permlink,
        });
      }
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
    this.setState({
      isPostsLoading: true,
      selectedFilterIndex: index,
    });
    this._loadPosts(filters[index]);
  };

  _onRightIconPress = () => {
    const { isHideImage } = this.state;

    this.setState({ isHideImage: !isHideImage });
  };

  _handleOnScrollStart = () => {
    const { handleOnScrollStart } = this.props;
    handleOnScrollStart();
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  render() {
    const {
      refreshing, posts, isPostsLoading, isHideImage, selectedFilterIndex,
    } = this.state;
    const {
      filterOptions, intl, isLoggedIn, getFor, isLoginDone,
    } = this.props;

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
        <Fragment>
          {filters[selectedFilterIndex] === 'feed'
            && getFor === 'feed'
            && !isLoggedIn
            && isLoginDone && (
              <NoPost
                isButtonText
                defaultText={intl.formatMessage({
                  id: 'profile.login_to_see',
                })}
                handleOnButtonPress={this._handleOnPressLogin}
              />
          )}
        </Fragment>

        {posts && posts.length > 0 && !isPostsLoading ? (
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <PostCard content={item} isHideImage={isHideImage} />}
            keyExtractor={(post, index) => index.toString()}
            onEndReached={this._loadMore}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={() => this._handleOnRefreshPosts()}
            onEndThreshold={0}
            initialNumToRender={10}
            ListFooterComponent={this._renderFooter}
            onScrollBeginDrag={() => this._handleOnScrollStart()}
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

export default withNavigation(injectIntl(PostsView));
