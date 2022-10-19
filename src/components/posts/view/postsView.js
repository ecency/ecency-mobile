/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, useEffect } from 'react';
import {
  FlatList,
  View,
  ActivityIndicator,
  RefreshControl,
  Text,
  TouchableOpacity,
  Button,
} from 'react-native';
import { useIntl } from 'react-intl';
import { get } from 'lodash';

// COMPONENTS
import FastImage from 'react-native-fast-image';
import { useNavigation } from '@react-navigation/native';
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import {
  PostCardPlaceHolder,
  NoPost,
  UserListItem,
  CommunityListItem,
  TextWithIcon,
} from '../../basicUIElements';
import { ThemeContainer } from '../../../containers';
import { IconButton } from '../../iconButton';

// Styles
import styles from './postsStyles';
import { default as ROUTES } from '../../../constants/routeNames';
import globalStyles from '../../../globalStyles';
import PostsList from '../../postsList';
import { isDarkTheme } from '../../../redux/actions/applicationActions';

let _onEndReachedCalledDuringMomentum = true;

const PostsView = ({
  filterOptions,
  selectedOptionIndex,
  handleImagesHide,
  isLoggedIn,
  handleOnScroll,
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
  isFeedScreen,
  newPostsPopupPictures,
  setNewPostsPopupPictures,
}) => {
  const navigation = useNavigation();

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
          <ActivityIndicator animating size="large" color={isDarkTheme ? '#2e3d51' : '#f5f5f5'} />
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
                keyExtractor={(item, index) => `${item._id || item.id}${index}`}
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
                    // isRightColor={item.isFollowing}
                    isLoggedIn={isLoggedIn}
                    isFollowing={item.isFollowing}
                    isLoadingRightAction={
                      followingUsers.hasOwnProperty(item._id) && followingUsers[item._id].loading
                    }
                    onPressRightText={handleFollowUserButtonPress}
                    handleOnPress={(username) =>
                      navigation.navigate({
                        name: ROUTES.SCREENS.PROFILE,
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
                keyExtractor={(item, index) => `${item.id || item.title}${index}`}
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
                        name: ROUTES.SCREENS.COMMUNITY,
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
      </View>
    );
  };

  const _scrollTop = () => {
    postsList.current.scrollToTop();
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

          <PostsList
            ref={postsList}
            promotedPosts={promotedPosts}
            showsVerticalScrollIndicator={false}
            onEndReached={_onEndReached}
            onMomentumScrollBegin={() => {
              _onEndReachedCalledDuringMomentum = false;
            }}
            removeClippedSubviews
            // TODO: we can avoid 2 more rerenders by carefully moving these call to postsListContainer
            refreshing={refreshing}
            onRefresh={handleOnRefreshPosts}
            onEndReachedThreshold={1}
            ListFooterComponent={_renderFooter}
            onScrollEndDrag={handleOnScroll}
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
            isFeedScreen={isFeedScreen}
          />

          {newPostsPopupPictures !== null && (
            <View style={styles.popupContainer}>
              <View style={styles.popupContentContainer}>
                <TouchableOpacity
                  onPress={() => {
                    _scrollTop();
                    handleOnRefreshPosts();
                    setNewPostsPopupPictures(null);
                  }}
                >
                  <View style={styles.popupContentContainer}>
                    <IconButton
                      iconStyle={styles.arrowUpIcon}
                      iconType="MaterialCommunityIcons"
                      name="arrow-up"
                      onPress={() => {
                        setNewPostsPopupPictures(null);
                      }}
                      size={12}
                    />

                    {newPostsPopupPictures.map((url, index) => (
                      <FastImage
                        key={`image_bubble_${url}`}
                        source={{ uri: url }}
                        style={[styles.popupImage, { zIndex: 10 - index }]}
                      />
                    ))}

                    <Text style={styles.popupText}>
                      {intl.formatMessage({ id: 'home.popup_postfix' })}
                    </Text>
                  </View>
                </TouchableOpacity>

                <IconButton
                  iconStyle={styles.closeIcon}
                  iconType="MaterialCommunityIcons"
                  name="close"
                  onPress={() => {
                    setNewPostsPopupPictures(null);
                  }}
                  size={12}
                />
              </View>
            </View>
          )}

          {/* <FlatList
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
            onEndReachedThreshold={1}
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
          /> */}
        </View>
      )}
    </ThemeContainer>
  );
};

export default PostsView;
/* eslint-enable */
