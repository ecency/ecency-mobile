import React, { useState } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import get from 'lodash/get';

// Services and Actions
import { search } from '../../../providers/esteem/esteem';
import { lookupAccounts, getTrendingTags, getPurePost } from '../../../providers/steem/dsteem';

// Constants
import ROUTES from '../../../constants/routeNames';

// Utilities
import { getResizedAvatar } from '../../../utils/image';
import postUrlParser from '../../../utils/postUrlParser';

// Component
import SearchModalView from '../view/searchModalView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const SearchModalContainer = ({
  navigation,
  isConnected,
  handleOnClose,
  username,
  isOpen,
  placeholder,
}) => {
  const [searchResults, setSearchResults] = useState({});

  const _handleCloseButton = () => {
    navigation.goBack();
  };

  const _handleOnChangeSearchInput = text => {
    if (text && text.length < 2) {
      return;
    }
    if (!isConnected) {
      return;
    }
    if (text && text !== '@' && text !== '#') {
      if (text[0] === '@') {
        lookupAccounts(text.substr(1)).then(res => {
          const users = res.map(item => ({
            image: getResizedAvatar(item),
            text: item,
            ...item,
          }));
          setSearchResults({ type: 'user', data: users });
        });
      } else if (text[0] === '#') {
        getTrendingTags(text.substr(1)).then(res => {
          const tags = res.map(item => ({
            text: `#${get(item, 'name', '')}`,
            ...item,
          }));

          setSearchResults({ type: 'tag', data: tags });
        });
      } else if (text.includes('https://') || text.includes('esteem://')) {
        const postUrl = postUrlParser(text.replace(/\s/g, ''));

        if (postUrl) {
          const { author, permlink, feedType, tag } = postUrl;

          if (author) {
            if (permlink) {
              getPurePost(author, permlink).then(post => {
                if (post.id !== 0) {
                  const result = {};
                  const metadata = JSON.parse(get(post, 'json_metadata', ''));
                  if (get(metadata, 'image', false) && metadata.image.length > 0) {
                    result.image = metadata.image[0];
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
              });
            } else {
              lookupAccounts(author).then(res => {
                const users = res.map(item => ({
                  image: getResizedAvatar(item),
                  text: item,
                  ...item,
                }));
                setSearchResults({ type: 'user', data: users });
              });
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
              //   routeName: ROUTES.SCREENS.SEARCH_RESULT,
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
              //   routeName: ROUTES.SCREENS.SEARCH_RESULT,
              //   params: {
              //     filter: feedType,
              //   },
              // });
            }
          }
        }
      } else {
        search({ q: text }).then(res => {
          res.results = res.results
            .filter(item => item.title !== '')
            .map(item => ({
              image: item.img_url || getResizedAvatar(get(item, 'author')),
              text: item.title,
              ...item,
            }));
          setSearchResults({ type: 'content', data: get(res, 'results', []) });
        });
      }
    }
  };

  const _handleOnPressListItem = (type, item) => {
    let routeName = null;
    let params = null;
    let key = null;

    handleOnClose();
    setSearchResults({});

    switch (type) {
      case 'user':
        routeName = get(item, 'text') === username ? ROUTES.TABBAR.PROFILE : ROUTES.SCREENS.PROFILE;
        params = {
          username: get(item, 'text'),
        };
        key = item.text;
        break;
      case 'content':
        routeName = ROUTES.SCREENS.POST;
        params = {
          author: get(item, 'author'),
          permlink: get(item, 'permlink'),
        };
        key = get(item, 'permlink');
        break;
      case 'tag':
        routeName = ROUTES.SCREENS.SEARCH_RESULT;
        params = {
          tag: get(item, 'text', '').substr(1),
        };
        break;

      case 'feedType':
        routeName = ROUTES.SCREENS.SEARCH_RESULT;
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

    if (routeName) {
      navigation.navigate({
        routeName,
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

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
  isConnected: state.application.isConnected,
});

export default connect(mapStateToProps)(withNavigation(SearchModalContainer));
