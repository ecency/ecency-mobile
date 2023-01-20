import React, { useState } from 'react';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { search } from '../../../providers/ecency/ecency';
import { lookupAccounts, getTrendingTags, getPurePost } from '../../../providers/hive/dhive';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities
import { getResizedAvatar } from '../../../utils/image';
import postUrlParser from '../../../utils/postUrlParser';

// Component
import SearchModalView from '../view/searchModalView';
import { postQueries } from '../../../providers/queries';

/*
 *            Props name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const SearchModalContainer = ({ isConnected, handleOnClose, username, isOpen, placeholder }) => {
  const navigation = useNavigation();
  const postsCachePrimer = postQueries.usePostsCachePrimer();

  const [searchResults, setSearchResults] = useState({});

  const _handleCloseButton = () => {
    navigation.goBack();
  };

  const _handleOnChangeSearchInput = (text) => {
    if (text && text.length < 3) {
      return;
    }
    if (!isConnected) {
      return;
    }
    if (text && text !== '@' && text !== '#') {
      if (text[0] === '@') {
        lookupAccounts(text.substr(1).trim())
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
        getTrendingTags(text.substr(1).trim())
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
              getPurePost(author, permlink)
                .then((post) => {
                  if (post.id !== 0) {
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
              lookupAccounts(author)
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
  };

  const _handleOnPressListItem = (type, item) => {
    let name = null;
    let params = null;
    let key = null;

    handleOnClose();
    setSearchResults({});

    switch (type) {
      case 'user':
        name = get(item, 'text') === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE;
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
  username: state.account.currentAccount.name,
  isConnected: state.application.isConnected,
});

export default connect(mapStateToProps)(SearchModalContainer);
