import React, { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getFriendsInfiniteQueryOptions } from '@ecency/sdk';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import get from 'lodash/get';

// Component
import FollowsScreen from '../screen/followsScreen';

/**
 * FollowsContainer - Function component using SDK's getFriendsInfiniteQueryOptions
 * Displays followers or following list with pagination and search
 */

const FollowsContainer = ({ route }) => {
  const { count, username, isFollowingPress } = route?.params || {};

  const [filterResult, setFilterResult] = useState(null);

  // Determine mode based on props
  const mode = isFollowingPress ? 'following' : 'followers';

  // Use SDK's infinite query for followers/following
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage, error, isError } =
    useInfiniteQuery({
      ...getFriendsInfiniteQueryOptions(username, mode),
      enabled: !!username,
    });

  // Flatten pages data into a single array
  const users = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flat();
  }, [data?.pages]);

  // Handle loading more users
  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // Handle search/filter
  const handleSearch = (text) => {
    if (!text || text.trim() === '') {
      setFilterResult(null);
      return;
    }

    const filteredUsers = users.filter((item) => {
      const itemName = isFollowingPress
        ? get(item, 'following', '').toUpperCase()
        : get(item, 'follower', '').toUpperCase();
      const searchText = text.toUpperCase();

      return itemName.indexOf(searchText) > -1;
    });

    setFilterResult(filteredUsers);
  };

  return (
    <FollowsScreen
      loadMore={handleLoadMore}
      isFollowing={isFollowingPress}
      data={filterResult || users}
      filterResult={filterResult}
      username={username}
      count={count}
      isLoading={isLoading || isFetchingNextPage}
      handleSearch={handleSearch}
      isError={isError}
      error={error}
    />
  );
};

export default gestureHandlerRootHOC(FollowsContainer);
