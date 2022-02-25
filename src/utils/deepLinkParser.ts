import { getPost, getUser } from '../providers/hive/dhive';
import postUrlParser from './postUrlParser';
import parseAuthUrl from './parseAuthUrl';
import get from 'lodash/get';
import ROUTES from '../constants/routeNames';

export const deepLinkParser = async (url, currentAccount) => {
  if (!url || url.indexOf('ShareMedia://') >= 0) return;

  let routeName;
  let params;
  let content;
  let profile;
  let keey;

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

      profile = await getUser(author);
      routeName = ROUTES.SCREENS.PROFILE;
      params = {
        username: get(profile, 'name'),
        reputation: get(profile, 'reputation'),
        deepLinkFilter, //TODO: process this in profile screen
      };
      keey = get(profile, 'name');
    } else if (permlink === 'communities') {
      routeName = ROUTES.SCREENS.WEB_BROWSER;
      params = {
        url: url,
      };
      keey = 'WebBrowser';
    } else if (permlink) {
      content = await getPost(author, permlink, currentAccount.name);
      routeName = ROUTES.SCREENS.POST;
      params = {
        content,
      };
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

  if (!routeName) {
    const { mode, referredUser } = parseAuthUrl(url) || {};
    if (mode === 'SIGNUP') {
      routeName = ROUTES.SCREENS.REGISTER;
      params = {
        referredUser,
      };
      keey = `${mode}/${referredUser || ''}`;
    }
  }

  return {
    routeName: routeName,
    params: params,
    key: keey,
  };
};
