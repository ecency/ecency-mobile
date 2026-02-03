import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import {
  lookupAccountsQueryOptions,
  getTrendingTagsQueryOptions,
  getPostQueryOptions,
  getSearchApiInfiniteQueryOptions,
} from '@ecency/sdk';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities
import { getResizedAvatar } from '../../../utils/image';
import postUrlParser from '../../../utils/postUrlParser';

// Component
import SearchModalView from '../view/searchModalView';
import { postQueries } from '../../../providers/queries';
import { selectIsConnected, selectCurrentAccountName } from '../../../redux/selectors';

/*
 *            Props name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const SearchModalContainer = ({ isConnected, handleOnClose, isOpen, placeholder, username }) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();
  const queryClient = useQueryClient();

  const [searchResults, setSearchResults] = useState({});
  const [searchMode, setSearchMode] = useState<'content' | 'user' | 'tag' | 'feedType' | 'none'>(
    'none',
  );
  const [contentQuery, setContentQuery] = useState('');

  const _handleCloseButton = () => {
    navigation.goBack();
  };

  // Core search logic (will be debounced)
  const normalizeSearchResponse = (res) => {
    if (!res) {
      return [];
    }
    if (Array.isArray(res)) {
      return res;
    }
    if (res.pages && Array.isArray(res.pages)) {
      return res.pages.flatMap((page) => page?.results || page?.items || []);
    }
    if (Array.isArray(res.results)) {
      return res.results;
    }
    if (Array.isArray(res.items)) {
      return res.items;
    }
    return [];
  };

  const contentQueryEnabled =
    searchMode === 'content' && isConnected && contentQuery && contentQuery.length >= 3;

  const contentSearchQuery = useInfiniteQuery({
    ...getSearchApiInfiniteQueryOptions(contentQuery, 'newest', false),
    enabled: contentQueryEnabled,
  });

  useEffect(() => {
    if (!contentQueryEnabled) {
      return;
    }

    const results = normalizeSearchResponse(contentSearchQuery.data)
      .filter((item) => typeof item?.title === 'string' && item.title.trim().length > 0)
      .map((item) => ({
        image: item.img_url || getResizedAvatar(get(item, 'author')),
        text: item.title,
        ...item,
      }));

    setSearchResults({ type: 'content', data: results });
  }, [contentSearchQuery.data, contentQueryEnabled]);

  const performSearch = useCallback(
    (text) => {
      if (text && text.length < 3) {
        setSearchMode('none');
        setContentQuery('');
        setSearchResults({});
        return;
      }
      if (!isConnected) {
        return;
      }
      if (text && text !== '@' && text !== '#') {
        if (text[0] === '@') {
          setSearchMode('user');
          setContentQuery('');
          queryClient
            .fetchQuery(lookupAccountsQueryOptions(text.slice(1).trim()))
            .then((res) => {
              const users = res
                ? res.map((item) => ({
                    image: getResizedAvatar(item),
                    text: item,
                    value: item,
                  }))
                : [];
              setSearchResults({ type: 'user', data: users });
            })
            .catch((e) => console.log('lookupAccounts', e));
        } else if (text[0] === '#') {
          setSearchMode('tag');
          setContentQuery('');
          queryClient
            .fetchQuery(getTrendingTagsQueryOptions(text.substr(1).trim(), 20))
            .then((res) => {
              const tags = res
                ? res.map((item) => ({
                    text: `#${get(item, 'name', '')}`,
                    ...item,
                  }))
                : [];

              setSearchResults({ type: 'tag', data: tags });
            })
            .catch((e) => console.log('getTrendingTags', e));
        } else if (
          text.includes('https://') ||
          text.includes('esteem://') ||
          text.includes('ecency://')
        ) {
          setSearchMode('feedType');
          setContentQuery('');
          const postUrl = postUrlParser(text.replace(/\s/g, ''));

          if (postUrl) {
            const { author, permlink, feedType, tag } = postUrl;

            if (author) {
              if (permlink) {
                queryClient
                  .fetchQuery(getPostQueryOptions(author, permlink, username || ''))
                  .then((post) => {
                    if (post.post_id !== 0) {
                      const result = {};
                      let metadata = {};
                      try {
                        metadata = JSON.parse(get(post, 'json_metadata', ''));
                      } catch (error) {
                        metadata = {};
                      }
                      if (get(metadata, 'image', false) && metadata.image.length > 0) {
                        [result.image] = metadata.image;
                      } else {
                        result.image = getResizedAvatar(author);
                      }
                      result.author = author;
                      result.text = post.title;
                      result.permlink = permlink;
                      setSearchResults({ type: 'content', data: [result] });
                    } else {
                      setSearchResults({ type: 'content', data: [] });
                    }
                  })
                  .catch((e) => console.log('getPurePost', e));
              } else {
                queryClient
                  .fetchQuery(lookupAccountsQueryOptions(author))
                  .then((res) => {
                    const users = res.map((item) => ({
                      image: getResizedAvatar(item),
                      text: item,
                      value: item,
                    }));
                    setSearchResults({ type: 'user', data: users });
                  })
                  .catch((e) => console.log('lookupAccounts', e));
              }
            } else if (feedType) {
              // handleOnClose();
              // setSearchResults({});
              if (tag) {
                setSearchResults({
                  type: 'feedType',
                  data: [{ text: `#${tag}`, tag, filter: feedType }],
                });
                // navigation.navigate({
                //   name: ROUTES.SCREENS.SEARCH_RESULT,
                //   params: {
                //     tag: tag,
                //     filter: feedType,
                //   },
                // });
              } else {
                setSearchResults({
                  type: 'feedType',
                  data: [{ text: `#${feedType}`, filter: feedType }],
                });
                // navigation.navigate({
                //   name: ROUTES.SCREENS.SEARCH_RESULT,
                //   params: {
                //     filter: feedType,
                //   },
                // });
              }
            }
          }
        } else {
          setSearchMode('content');
          setSearchResults({ type: 'content', data: [] });
          setContentQuery(text);
        }
      }
    },
    [isConnected, queryClient, username],
  );

  // Create debounced version of search with 500ms delay
  const debouncedSearch = useMemo(() => debounce(performSearch, 500), [performSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handler called on input change - triggers debounced search
  const _handleOnChangeSearchInput = useCallback(
    (text) => {
      debouncedSearch(text);
    },
    [debouncedSearch],
  );

  const _handleOnPressListItem = (type, item) => {
    let name = null;
    let params = null;
    let key = null;

    handleOnClose();
    setSearchResults({});

    switch (type) {
      case 'user':
        name = ROUTES.SCREENS.PROFILE;
        params = {
          username: get(item, 'text'),
        };
        key = item.text;
        break;
      case 'content':
        postsCachePrimer.cachePost(item);
        name = ROUTES.SCREENS.POST;
        params = {
          author: get(item, 'author'),
          permlink: get(item, 'permlink'),
        };
        key = get(item, 'permlink');
        break;
      case 'tag':
        name = ROUTES.SCREENS.SEARCH_RESULT;
        params = {
          tag: get(item, 'text', '').substr(1),
        };
        break;

      case 'feedType':
        name = ROUTES.SCREENS.SEARCH_RESULT;
        if (get(item, 'tag', false)) {
          params = {
            tag: get(item, 'tag', ''),
            filter: get(item, 'filter', ''),
          };
        } else {
          params = {
            filter: get(item, 'filter', ''),
          };
        }
        break;

      default:
        break;
    }

    if (name) {
      navigation.navigate({
        name,
        params,
        key,
      });
    }
  };

  const _handleLoadMore = useCallback(() => {
    if (searchMode !== 'content') {
      return;
    }
    if (!contentQueryEnabled || !contentSearchQuery.hasNextPage) {
      return;
    }
    if (contentSearchQuery.isFetchingNextPage) {
      return;
    }
    contentSearchQuery.fetchNextPage().catch((err) => console.log('search load more', err));
  }, [
    searchMode,
    contentQueryEnabled,
    contentSearchQuery.hasNextPage,
    contentSearchQuery.isFetchingNextPage,
    contentSearchQuery.fetchNextPage,
  ]);

  return (
    <SearchModalView
      handleCloseButton={_handleCloseButton}
      handleOnChangeSearchInput={_handleOnChangeSearchInput}
      handleOnClose={handleOnClose}
      handleOnPressListItem={_handleOnPressListItem}
      isOpen={isOpen}
      placeholder={placeholder}
      searchResults={searchResults}
      onLoadMore={_handleLoadMore}
      hasMore={searchMode === 'content' && !!contentSearchQuery.hasNextPage}
      isLoadingMore={searchMode === 'content' && contentSearchQuery.isFetchingNextPage}
    />
  );
};

const mapStateToProps = (state) => ({
  username: selectCurrentAccountName(state),
  isConnected: selectIsConnected(state),
});

export default connect(mapStateToProps)(SearchModalContainer);
