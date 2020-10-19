/* eslint-disable react/jsx-wrap-multilines */
import React, { useRef, useEffect, useState } from 'react';
import { FlatList, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useIntl } from 'react-intl';
import { withNavigation } from 'react-navigation';
import { get } from 'lodash';

// COMPONENTS
import { PostCard } from '../../postCard';
import { FilterBar } from '../../filterBar';
import { PostCardPlaceHolder, NoPost } from '../../basicUIElements';
import { ThemeContainer } from '../../../containers';

// Styles
import styles from './postsStyles';
import { default as ROUTES } from '../../../constants/routeNames';

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
  handleOnDropdownSelect,
  handleOnRefreshPosts,
  loadPosts,
}) => {
  const intl = useIntl();
  const postsList = useRef(null);

  const _handleOnDropdownSelect = async (index) => {
    if (index === selectedFilterIndex) {
      _scrollTop();
    } else {
      if (filterOptions && filterOptions.length > 0) {
        setSelectedFilterValue(filterOptionsValue[index]);
      }

      handleOnDropdownSelect(index);
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
      return (
        <NoPost
          imageStyle={styles.noImage}
          name={tag}
          text={intl.formatMessage({
            id: 'profile.havent_posted',
          })}
          defaultText={intl.formatMessage({
            id: selectedFilterValue === 'feed' ? 'profile.follow_people' : 'profile.havent_posted',
          })}
        />
      );
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
              onDropdownSelect={_handleOnDropdownSelect}
              onRightIconPress={handleImagesHide}
            />
          )}

          <FlatList
            ref={postsList}
            data={posts}
            showsVerticalScrollIndicator={false}
            renderItem={_renderItem}
            keyExtractor={(content, i) => `key-${i.toString()}`}
            onEndReached={_onEndReached}
            onMomentumScrollBegin={() => {
              _onEndReachedCalledDuringMomentum = false;
            }}
            removeClippedSubviews
            refreshing={refreshing}
            onRefresh={handleOnRefreshPosts}
            onEndReachedThreshold={2}
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
