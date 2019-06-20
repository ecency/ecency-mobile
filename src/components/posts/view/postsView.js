import React, { Component, Fragment } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl } from 'react-native';
import { injectIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';

// STEEM
import { getPostsSummary } from '../../../providers/steem/dsteem';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';
import { POPULAR_FILTERS, PROFILE_FILTERS } from '../../../constants/options/filters';

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
      isPostsLoading: true,
      isHideImage: false,
      selectedFilterIndex: props.selectedOptionIndex || 0,
      isNoPost: false,
    };
  }

  // Component Functions
  componentWillMount() {
    const { navigation } = this.props;

    navigation.setParams({
      scrollToTop: this._scrollToTop,
    });
  }

  componentDidMount() {
    this._loadPosts();
  }

  componentWillReceiveProps(nextProps) {
    const { currentAccountUsername, changeForceLoadPostState } = this.props;

    if (
      (currentAccountUsername !== nextProps.currentAccountUsername &&
        nextProps.currentAccountUsername) ||
      nextProps.forceLoadPost
    ) {
      // Set all initial data (New user new rules)
      this.setState(
        {
          posts: [],
          startAuthor: '',
          startPermlink: '',
          refreshing: false,
          isLoading: false,
          isPostsLoading: false,
          isHideImage: false,
          selectedFilterIndex: 0,
          isNoPost: false,
        },
        () => {
          this._loadPosts();
          if (changeForceLoadPostState) {
            changeForceLoadPostState(false);
          }
        },
      );
    }
  }

  _scrollToTop = () => {
    if (this.flatList) this.flatList.scrollToOffset({ x: 0, y: 0, animated: true });
  };

  _loadPosts = () => {
    const { getFor, tag, currentAccountUsername, pageType, nsfw } = this.props;
    const { posts, startAuthor, startPermlink, refreshing, selectedFilterIndex } = this.state;
    const filter =
      pageType === 'posts'
        ? POPULAR_FILTERS[selectedFilterIndex].toLowerCase()
        : PROFILE_FILTERS[selectedFilterIndex].toLowerCase();
    let options;
    let newPosts = [];

    this.setState({ isLoading: true });
    if (tag || filter === 'feed' || filter === 'blog' || getFor === 'blog') {
      options = {
        tag,
        limit: 3,
      };
    } else if (filter === 'reblogs') {
      options = {
        tag,
        limit: 3,
      };
    } else {
      options = {
        limit: 3,
      };
    }

    if (startAuthor && startPermlink && !refreshing) {
      options.start_author = startAuthor;
      options.start_permlink = startPermlink;
    }

    getPostsSummary(filter, options, currentAccountUsername, nsfw)
      .then(result => {
        if (result.length > 0) {
          let _posts = result;

          if (filter === 'reblogs') {
            for (let i = _posts.length - 1; i >= 0; i--) {
              if (_posts[i].author === currentAccountUsername) {
                _posts.splice(i, 1);
              }
            }
          }
          if (_posts.length > 0) {
            if (posts.length > 0) {
              if (refreshing) {
                // TODO: make sure post is not duplicated, because checking with `includes` might re-add post
                // if there was change in post object from blockchain
                newPosts = _posts.filter(post => posts.includes(post));
                _posts = [...newPosts, ...posts];
              } else {
                _posts.shift();
                _posts = [...posts, ..._posts];
              }
            }

            if (refreshing && newPosts.length > 0) {
              this.setState({
                posts: _posts,
              });
            } else if (!refreshing) {
              this.setState({
                posts: _posts,
                startAuthor: result[result.length - 1] && result[result.length - 1].author,
                startPermlink: result[result.length - 1] && result[result.length - 1].permlink,
              });
            }

            this.setState({
              refreshing: false,
              isPostsLoading: false,
            });
          }
        } else if (result.length === 0) {
          this.setState({ isNoPost: true });
        }
      })
      .catch(() => {
        this.setState({
          refreshing: false,
          isPostsLoading: false,
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

  _handleOnDropdownSelect = async index => {
    await this.setState({
      isPostsLoading: true,
      selectedFilterIndex: index,
      posts: [],
      startAuthor: '',
      startPermlink: '',
      isNoPost: false,
    });
    this._loadPosts();
  };

  _onRightIconPress = () => {
    const { isHideImage } = this.state;

    this.setState({ isHideImage: !isHideImage });
  };

  _handleOnScrollStart = () => {
    const { handleOnScrollStart, handleOnScroll } = this.props;
    handleOnScrollStart();

    if (handleOnScroll) handleOnScroll();
  };

  _handleOnPressLogin = () => {
    const { navigation } = this.props;
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  render() {
    const { refreshing, posts, isPostsLoading, isHideImage, isNoPost } = this.state;
    const {
      filterOptions,
      selectedOptionIndex,
      intl,
      isLoggedIn,
      getFor,
      isLoginDone,
      tag,
      isDarkTheme,
    } = this.props;

    return (
      <View style={styles.container}>
        {filterOptions && (
          <FilterBar
            dropdownIconName="arrow-drop-down"
            options={filterOptions}
            selectedOptionIndex={selectedOptionIndex}
            defaultText={filterOptions[selectedOptionIndex]}
            rightIconName="view-module"
            rightIconType="MaterialIcons"
            onDropdownSelect={this._handleOnDropdownSelect}
            onRightIconPress={this._onRightIconPress}
          />
        )}
        <Fragment>
          {getFor === 'feed' && isLoginDone && !isLoggedIn && (
            <NoPost
              imageStyle={styles.noImage}
              isButtonText
              defaultText={intl.formatMessage({
                id: 'profile.login_to_see',
              })}
              handleOnButtonPress={this._handleOnPressLogin}
            />
          )}
        </Fragment>

        {posts && posts.length > 0 && !isPostsLoading && (
          <FlatList
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PostCard isRefresh={refreshing} content={item} isHideImage={isHideImage} />
            )}
            keyExtractor={(post, index) => index.toString()}
            onEndReached={() => this._loadPosts()}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={() => this._handleOnRefreshPosts()}
            onEndThreshold={0}
            initialNumToRender={10}
            ListFooterComponent={this._renderFooter}
            onScrollBeginDrag={() => this._handleOnScrollStart()}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={this._handleOnRefreshPosts}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
            ref={ref => {
              this.flatList = ref;
            }}
          />
        )}

        {isNoPost ? (
          <NoPost
            imageStyle={styles.noImage}
            name={tag}
            text={intl.formatMessage({
              id: 'profile.havent_posted',
            })}
            defaultText={intl.formatMessage({
              id: 'profile.login_to_see',
            })}
          />
        ) : (
          <Fragment>
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </Fragment>
        )}
      </View>
    );
  }
}

export default withNavigation(injectIntl(PostsView));
