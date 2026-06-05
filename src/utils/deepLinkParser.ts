import get from 'lodash/get';
import { getQueryClient, getAccountFullQueryOptions } from '@ecency/sdk';
import postUrlParser from './postUrlParser';
import parseAuthUrl, { AUTH_MODES } from './parseAuthUrl';
import ROUTES from '../constants/routeNames';
import parsePurchaseUrl from './parsePurchaseUrl';

export const deepLinkParser = async (url) => {
  if (!url || url.indexOf('ShareMedia://') >= 0) return;

  let routeName;
  let params;
  let profile;
  let keey;

  // profess url for post/content
  const postUrl = postUrlParser(url);
  console.log('postUrl : ', postUrl);

  const { author, permlink, feedType, tag } = postUrl || {};

  if (author) {
    if (
      !permlink ||
      permlink === 'wallet' ||
      permlink === 'points' ||
      permlink === 'comments' ||
      permlink === 'replies' ||
      permlink === 'posts'
    ) {
      let deepLinkFilter;
      if (permlink) {
        deepLinkFilter = permlink === 'points' ? 'wallet' : permlink;
      }

      const queryClient = getQueryClient();
      profile = await queryClient.fetchQuery(getAccountFullQueryOptions(author));
      routeName = ROUTES.SCREENS.PROFILE;
      params = {
        username: get(profile, 'name'),
        reputation: get(profile, 'reputation'),
        deepLinkFilter, // TODO: process this in profile screen
      };
      keey = get(profile, 'name');
    } else if (permlink === 'communities') {
      routeName = ROUTES.SCREENS.WEB_BROWSER;
      params = {
        url,
      };
      keey = 'WebBrowser';
    } else if (permlink === 'followers' || permlink === 'following') {
      routeName = ROUTES.SCREENS.FOLLOWS;
      // No count is available at parse time; FollowsScreen omits the header count when it
      // is not a number, and the list still loads from username + mode.
      params = {
        username: author,
        isFollowingPress: permlink === 'following',
      };
      keey = `${author}/${permlink}`;
    } else if (permlink) {
      params = { author, permlink };
      routeName = ROUTES.SCREENS.POST;
      keey = `${author}/${permlink}`;
    }
  }

  if (feedType === 'hot' || feedType === 'trending' || feedType === 'created') {
    if (!tag) {
      routeName = ROUTES.SCREENS.TAG_RESULT;
    } else if (/hive-[1-3]\d{4,6}$/.test(tag)) {
      routeName = ROUTES.SCREENS.COMMUNITY;
    } else {
      routeName = ROUTES.SCREENS.TAG_RESULT;
    }
    params = {
      tag,
      filter: feedType,
    };
    keey = `${feedType}/${tag || ''}`;
  }

  // Standalone web-standard routes -> native screens. postUrlParser surfaces a bare path
  // like /communities, /search, /bookmarks or /wallet as a feedType with no tag. params
  // must be a truthy object: useLinkProcessor only navigates natively when name && params
  // && key are all set, otherwise it falls back to the in-app web browser.
  // Gate on Ecency hosts so external links (e.g. https://example.com/wallet) still open in
  // the in-app browser instead of hijacking to a native Ecency screen.
  const isEcencyUrl =
    /^(ecency|esteem):\/\//i.test(url) ||
    /^https?:\/\/(www\.)?(ecency\.com|esteem\.app|estm\.to)(\/|$)/i.test(url);
  if (!routeName && isEcencyUrl && feedType && !tag) {
    switch (feedType) {
      case 'communities':
        routeName = ROUTES.SCREENS.COMMUNITIES;
        params = {};
        keey = 'communities';
        break;
      case 'search':
        routeName = ROUTES.SCREENS.SEARCH_RESULT;
        params = {};
        keey = 'search';
        break;
      case 'bookmarks':
        routeName = ROUTES.SCREENS.BOOKMARKS;
        params = {};
        keey = 'bookmarks';
        break;
      case 'wallet':
        routeName = ROUTES.TABBAR.WALLET;
        params = {};
        keey = 'wallet';
        break;
      default:
        break;
    }
  }

  // process url for authentication
  if (!routeName) {
    const data = parseAuthUrl(url);
    if (data) {
      const { mode, referredUser, username, code, email } = data;

      if (mode === AUTH_MODES.SIGNUP) {
        routeName = ROUTES.SCREENS.REGISTER;
        params = {
          referredUser,
          username,
          email,
        };
        keey = `${mode}/${referredUser || ''}`;
      }

      if (mode === AUTH_MODES.AUTH) {
        routeName = ROUTES.SCREENS.LOGIN;
        params = {
          username,
          code,
        };
        keey = `${mode}/${username || ''}`;
      }
    }
  }

  // process url for purchasing
  if (!routeName) {
    const { type, username, email, referredUser, productId } = parsePurchaseUrl(url) || {};

    if (type && type === 'boost') {
      routeName = ROUTES.SCREENS.ACCOUNT_BOOST;
      params = {
        username,
      };
      keey = `${type}/${username || ''}`;
    }
    if (type && type === 'points') {
      routeName = ROUTES.SCREENS.BOOST;
      params = {
        username,
        productId,
      };
      keey = `${type}/${username || ''}`;
    }
    if (type && type === 'account') {
      routeName = ROUTES.SCREENS.REGISTER;
      (params = {
        username,
        email,
        referredUser,
        purchaseOnly: true,
      }),
        (keey = `${type}/${username || ''}`);
    }
  }

  return {
    name: routeName,
    params,
    key: keey,
  };
};
