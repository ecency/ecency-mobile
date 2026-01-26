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
} from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { search } from '../../../providers/ecency/ecency';

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

const SearchModalContainer = ({ isConnected, handleOnClose, isOpen, placeholder }) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();
  const queryClient = useQueryClient();

  const [searchResults, setSearchResults] = useState({});

  const _handleCloseButton = () => {
    navigation.goBack();
  };

  // Core search logic (will be debounced)
  const performSearch = useCallback(
    (text) => {
      if (text && text.length < 3) {
        return;
      }
      if (!isConnected) {
        return;
      }
      if (text && text !== '@' && text !== '#') {
        if (text[0] === '@') {
          queryClient
            .fetchQuery(lookupAccountsQueryOptions(text.substr(1).trim()))
            .then((res) => {
              const users = res
                ? res.map((item) => ({
                    image: getResizedAvatar(item),
                    text: item,
                    ...item,
                  }))
                : [];
              setSearchResults({ type: 'user', data: users });
            })
            .catch((e) => console.log('lookupAccounts', e));
        } else if (text[0] === '#') {
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
          const postUrl = postUrlParser(text.replace(/\s/g, ''));

          if (postUrl) {
            const { author, permlink, feedType, tag } = postUrl;

            if (author) {
              if (permlink) {
                queryClient
                  .fetchQuery(getPostQueryOptions(author, permlink, ''))
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
                      ...item,
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
          search({ q: text })
            .then((res) => {
              res.results = res.results
                .filter((item) => item.title !== '')
                .map((item) => ({
                  image: item.img_url || getResizedAvatar(get(item, 'author')),
                  text: item.title,
                  ...item,
                }));
              setSearchResults({ type: 'content', data: get(res, 'results', []) });
            })
            .catch((e) => console.log('search', e));
        }
      }
    },
    [isConnected, queryClient],
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

  return (
    <SearchModalView
      handleCloseButton={_handleCloseButton}
      handleOnChangeSearchInput={_handleOnChangeSearchInput}
      handleOnClose={handleOnClose}
      handleOnPressListItem={_handleOnPressListItem}
      isOpen={isOpen}
      placeholder={placeholder}
      searchResults={searchResults}
    />
  );
};

const mapStateToProps = (state) => ({
  username: selectCurrentAccountName(state),
  isConnected: selectIsConnected(state),
});

export default connect(mapStateToProps)(SearchModalContainer);
