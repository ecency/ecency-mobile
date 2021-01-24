/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, useEffect } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl, Text } from 'react-native';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import { get } from 'lodash';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import {
  PostCardPlaceHolder,
  NoPost,
  UserListItem,
  CommunityListItem,
} from '../../basicUIElements';
import { ThemeContainer } from '../../../containers';

// Styles
import styles from './postsStyles';
import { default as ROUTES } from '../../../constants/routeNames';
import globalStyles from '../../../globalStyles';

let _onEndReachedCalledDuringMomentum = true;

const PostsView = ({
  filterOptions,
  selectedOptionIndex,
  isHideImage,
  handleImagesHide,
  tag,
  isLoggedIn,
  handleOnScroll,
  navigation,
  posts,
  isLoading,
  refreshing,
  selectedFilterIndex,
  isNoPost,
  promotedPosts,
  selectedFilterValue,
  setSelectedFilterValue,
  filterOptionsValue,
  handleFilterOnDropdownSelect,
  handleOnRefreshPosts,
  loadPosts,
  feedSubfilterOptions,
  selectedFeedSubfilterIndex,
  feedSubfilterOptionsValue,
  handleFeedSubfilterOnDropdownSelect,
  setSelectedFeedSubfilterValue,
  selectedFeedSubfilterValue,
  getRecommendedUsers,
  getRecommendedCommunities,
  recommendedUsers,
  recommendedCommunities,
  handleFollowUserButtonPress,
  handleSubscribeCommunityButtonPress,
  followingUsers,
  subscribingCommunities,
}) => {
  const intl = useIntl();
  const postsList = useRef(null);

  useEffect(() => {
    if (isNoPost) {
      if (selectedFilterValue === 'feed') {
        if (selectedFeedSubfilterValue === 'friends') {
          if (recommendedUsers.length === 0) {
            getRecommendedUsers();
          }
        } else {
          if (recommendedCommunities.length === 0) {
            getRecommendedCommunities();
          }
        }
      }
    }
  }, [isNoPost, selectedFilterValue, selectedFeedSubfilterValue]);

  const _handleFilterOnDropdownSelect = async (index) => {
    if (index === selectedFilterIndex) {
      _scrollTop();
    } else {
      if (filterOptions && filterOptions.length > 0) {
        setSelectedFilterValue(filterOptionsValue[index]);
      }

      handleFilterOnDropdownSelect(index);
    }
  };

  const _handleFeedSubfilterOnDropdownSelect = async (index) => {
    if (index === selectedFeedSubfilterIndex) {
      _scrollTop();
    } else {
      if (feedSubfilterOptions && feedSubfilterOptions.length > 0) {
        setSelectedFeedSubfilterValue(feedSubfilterOptionsValue[index]);
      }

      handleFeedSubfilterOnDropdownSelect(index);
    }
  };

  const _renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.flatlistFooter}>
          <ActivityIndicator animating size="large" />
        </View>
      );
    }

    return null;
  };

  const _handleOnPressLogin = () => {
    navigation.navigate(ROUTES.SCREENS.LOGIN);
  };

  const _renderEmptyContent = () => {
    if ((selectedFilterValue === 'feed' || selectedFilterValue === 'blog') && !isLoggedIn) {
      return (
        <NoPost
          imageStyle={styles.noImage}
          isButtonText
          defaultText={intl.formatMessage({
            id: 'profile.login_to_see',
          })}
          handleOnButtonPress={_handleOnPressLogin}
        />
      );
    }

    if (isNoPost) {
      if (selectedFilterValue === 'feed') {
        if (selectedFeedSubfilterValue === 'friends') {
          return (
            <>
              <Text style={[globalStyles.subTitle, styles.noPostTitle]}>
                {intl.formatMessage({ id: 'profile.follow_people' })}
              </Text>
              <FlatList
                data={recommendedUsers}
                extraData={recommendedUsers}
                renderItem={({ item, index }) => (
                  <UserListItem
                    index={index}
                    username={item._id}
                    isHasRightItem
                    rightText={
                      item.isFollowing
                        ? intl.formatMessage({ id: 'user.unfollow' })
                        : intl.formatMessage({ id: 'user.follow' })
                    }
                    //isRightColor={item.isFollowing}
                    isLoggedIn={isLoggedIn}
                    isFollowing={item.isFollowing}
                    isLoadingRightAction={
                      followingUsers.hasOwnProperty(item._id) && followingUsers[item._id].loading
                    }
                    onPressRightText={handleFollowUserButtonPress}
                    handleOnPress={(username) =>
                      navigation.navigate({
                        routeName: ROUTES.SCREENS.PROFILE,
                        params: {
                          username,
                        },
                        key: username,
                      })
                    }
                  />
                )}
              />
            </>
          );
        } else {
          return (
            <>
              <Text style={[globalStyles.subTitle, styles.noPostTitle]}>
                {intl.formatMessage({ id: 'profile.follow_communities' })}
              </Text>
              <FlatList
                data={recommendedCommunities}
                renderItem={({ item, index }) => (
                  <CommunityListItem
                    index={index}
                    title={item.title}
                    about={item.about}
                    admins={item.admins}
                    id={item.id}
                    authors={item.num_authors}
                    posts={item.num_pending}
                    subscribers={item.subscribers}
                    isNsfw={item.is_nsfw}
                    name={item.name}
                    handleOnPress={(name) =>
                      navigation.navigate({
                        routeName: ROUTES.SCREENS.COMMUNITY,
                        params: {
                          tag: name,
                        },
                      })
                    }
                    handleSubscribeButtonPress={handleSubscribeCommunityButtonPress}
                    isSubscribed={item.isSubscribed}
                    isLoadingRightAction={
                      subscribingCommunities.hasOwnProperty(item.name) &&
                      subscribingCommunities[item.name].loading
                    }
                    isLoggedIn={isLoggedIn}
                  />
                )}
              />
            </>
          );
        }
      } else {
        return <Text>{intl.formatMessage({ id: 'profile.havent_posted' })}</Text>;
      }
    }

    return (
      <View style={styles.placeholderWrapper}>
        <PostCardPlaceHolder />
        <PostCardPlaceHolder />
      </View>
    );
  };

  const _handleOnScroll = () => {
    if (handleOnScroll) {
      handleOnScroll();
    }
  };

  const _scrollTop = () => {
    postsList.current.scrollToOffset({ x: 0, y: 0, animated: true });
  };

  const _renderItem = ({ item, index }) => {
    const e = [];
    if (index % 3 === 0) {
      const ix = index / 3 - 1;
      if (promotedPosts[ix] !== undefined) {
        const p = promotedPosts[ix];
        if (get(p, 'author', null) && posts.filter((x) => x.permlink === p.permlink).length <= 0) {
          e.push(
            <PostCard
              key={`${p.author}-${p.permlink}-prom`}
              isRefresh={refreshing}
              content={p}
              isHideImage={isHideImage}
            />,
          );
        }
      }
    }
    if (get(item, 'author', null)) {
      e.push(
        <PostCard
          key={`${item.author}-${item.permlink}`}
          isRefresh={refreshing}
          content={item}
          isHideImage={isHideImage}
        />,
      );
    }
    return e;
  };

  const _onEndReached = ({ distanceFromEnd }) => {
    if (!_onEndReachedCalledDuringMomentum) {
      loadPosts();
      _onEndReachedCalledDuringMomentum = true;
    }
  };

  return (
    <ThemeContainer>
      {({ isDarkTheme }) => (
        <View style={styles.container}>
          {filterOptions && (
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={filterOptions.map((item) =>
                intl.formatMessage({ id: `home.${item.toLowerCase()}` }).toUpperCase(),
              )}
              selectedOptionIndex={selectedFilterIndex}
              defaultText={filterOptions[selectedOptionIndex]}
              rightIconName="view-module"
              rightIconType="MaterialIcons"
              onDropdownSelect={_handleFilterOnDropdownSelect}
              onRightIconPress={handleImagesHide}
            />
          )}
          {isLoggedIn && selectedFilterValue === 'feed' && (
            <FilterBar
              dropdownIconName="arrow-drop-down"
              options={feedSubfilterOptions.map((item) =>
                intl.formatMessage({ id: `home.${item.toLowerCase()}` }).toUpperCase(),
              )}
              selectedOptionIndex={selectedFeedSubfilterIndex}
              defaultText={feedSubfilterOptions[selectedFeedSubfilterIndex]}
              onDropdownSelect={_handleFeedSubfilterOnDropdownSelect}
            />
          )}

          <FlatList
            ref={postsList}
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={_renderItem}
            keyExtractor={(content, i) => content.permlink}
            onEndReached={_onEndReached}
            onMomentumScrollBegin={() => {
              _onEndReachedCalledDuringMomentum = false;
            }}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={handleOnRefreshPosts}
            onEndReachedThreshold={0.5}
            ListFooterComponent={_renderFooter}
            onScrollEndDrag={_handleOnScroll}
            ListEmptyComponent={_renderEmptyContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleOnRefreshPosts}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
          />
        </View>
      )}
    </ThemeContainer>
  );
};

export default withNavigation(PostsView);
/* eslint-enable */
