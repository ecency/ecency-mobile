import api from '../../config/api';
import ecencyApi from '../../config/ecencyApi';
import searchApi from '../../config/search';
import { upload } from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import { jsonStringify } from '../../utils/jsonUtils';
import bugsnag from '../../config/bugsnag';
import { SERVER_LIST } from '../../constants/options/api';

export const getCurrencyRate = (currency) =>
  api
    .get(`/market-data/currency-rate/${currency}/hbd?fixed=1`)
    .then((resp) => resp.data)
    .catch((err) => {
      bugsnag.notify(err);
      //TODO: save currency rate of offline values
      return 1;
    });

export const getCurrencyTokenRate = (currency, token) =>
  api
    .get(`/market-data/currency-rate/${currency}/${token}`)
    .then((resp) => resp.data)
    .catch((err) => {
      bugsnag.notify(err);
      return 0;
    });

/**
 * @params username
 */
export const getDrafts = (username) => api.get(`/drafts/${username}`).then((resp) => resp.data);

/*export const getDrafts = data =>
  new Promise((resolve, reject) => {
    api
      .get(`/drafts/${data}`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        bugsnag.notify(error);
        reject(error);
      });
  });
*/
/**
 * @params username
 * @params draftID
 */
export const removeDraft = (username, id) =>
  new Promise((resolve, reject) => {
    api
      .delete(`/drafts/${username}/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

/**
 * @params username
 * @params body
 * @params title
 * @params tags
 */
export const addDraft = (data) =>
  new Promise((resolve, reject) => {
    api
      .post('/draft', data)
      .then((res) => {
        const { drafts } = res.data;
        if (drafts) {
          resolve(drafts.pop());
        }
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

/**
 * @params username
 * @params body
 * @params title
 * @params tags
 */
export const updateDraft = (data) =>
  new Promise((resolve, reject) => {
    api
      .put(`/drafts/${data.username}/${data.draftId}`, {
        title: data.title,
        body: data.body,
        tags: data.tags,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const addBookmark = (username, author, permlink) =>
  api
    .post('/bookmark', {
      username,
      author,
      permlink,
      chain: 'hive',
    })
    .then((resp) => resp.data);

export const addReport = (url) =>
  api
    .post('/report', {
      url,
    })
    .then((resp) => resp.data);

/**
 * @params current username
 */
export const getBookmarks = (username) =>
  api.get(`/bookmarks/${username}`).then((resp) => resp.data);

/**
 * @params id
 * @params current username
 */
export const removeBookmark = (username, id) => api.delete(`/bookmarks/${username}/${id}`);

/**
 * @params current username
 */
export const getFavorites = (username) =>
  api.get(`/favorites/${username}`).then((resp) => resp.data);

/**
 * @params current username
 * @params target username
 */
export const getIsFavorite = (targetUsername, currentUsername) =>
  api.get(`/isfavorite/${currentUsername}/${targetUsername}`).then((resp) => resp.data);

/**
 * @params current username
 * @params target username
 */
export const addFavorite = (currentUsername, targetUsername) =>
  api
    .post('/favorite', {
      username: currentUsername,
      account: targetUsername,
    })
    .then((resp) => resp.data);

/**
 * @params current username
 * @params target username
 */
export const removeFavorite = (currentUsername, targetUsername) =>
  api.delete(`/favoriteUser/${currentUsername}/${targetUsername}`);

/**
 * @params current username
 */
export const getSnippets = (username) =>
  api.get(`/fragments/${username}`).then((resp) => resp.data);

/**
 * @params current username
 * @params title title
 * @params body body
 */
export const addSnippet = (currentUsername, title, body) =>
  api
    .post(`/fragment`, {
      username: currentUsername,
      title,
      body,
    })
    .then((resp) => resp.data);

/**
 * @params current username
 * @params fragmentid id
 * @params title title
 * @params body body
 */
export const updateSnippet = (username, id, title, body) =>
  new Promise((resolve, reject) => {
    api
      .put(`/fragments/${username}/${id}`, {
        title,
        body,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

/**
 * @params current username
 * @params fragmentid id
 */
export const removeSnippet = (username, id) =>
  new Promise((resolve, reject) => {
    api
      .delete(`/fragments/${username}/${id}`)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const getLeaderboard = (duration) =>
  api
    .get('/leaderboard', {
      params: {
        duration,
      },
    })
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      bugsnag.notify(error);
    });

export const getActivities = (data) =>
  new Promise((resolve, reject) => {
    let url = null;
    switch (data.type) {
      case 'activities':
        url = `/activities/${data.user}`;
        break;
      case 'votes':
        url = `/rvotes/${data.user}`;
        break;
      case 'replies':
        url = `/replies/${data.user}`;
        break;
      case 'mentions':
        url = `/mentions/${data.user}`;
        break;
      case 'follows':
        url = `/follows/${data.user}`;
        break;
      case 'reblogs':
        url = `/reblogs/${data.user}`;
        break;
      case 'transfers':
        url = `/transfers/${data.user}`;
        break;
      default:
        url = `/activities/${data.user}`;
        break;
    }
    api
      .get(url, {
        params: {
          since: data.since,
        },
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const getUnreadActivityCount = (data) =>
  new Promise((resolve, reject) => {
    api
      .get(`/activities/${data.user}/unread-count`)
      .then((res) => {
        resolve(res.data ? res.data.count : 0);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const markActivityAsRead = (user, id = null) =>
  new Promise((resolve, reject) => {
    api
      .put(`/activities/${user}`, {
        id,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const setPushToken = (data) =>
  new Promise((resolve, reject) => {
    api
      .post('/rgstrmbldvc/', data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

// SEARCH API

export const search = (data) =>
  new Promise((resolve, reject) => {
    searchApi
      .post('/search', data)
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const searchPath = (q) =>
  new Promise((resolve, reject) => {
    searchApi
      .post('/search-path', {
        q,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const searchAccount = (q = '', limit = 20, random = 0) =>
  new Promise((resolve, reject) => {
    searchApi
      .post('/search-account', {
        q,
        limit,
        random,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

export const searchTag = (q = '', limit = 20, random = 0) =>
  new Promise((resolve, reject) => {
    searchApi
      .post('/search-tag', {
        q,
        limit,
        random,
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((error) => {
        bugsnag.notify(error);
        reject(error);
      });
  });

// Schedule
export const schedule = (
  user,
  title,
  permlink,
  json,
  tags,
  body,
  operationType,
  upvote,
  scheduleDate,
  options = null,
) =>
  api
    .post('/schedules', {
      username: user,
      title,
      permlink,
      meta: json,
      body,
      schedule: scheduleDate,
      options,
      reblog: 0,
    })
    .then((resp) => resp.data);

export const getSchedules = (username) =>
  api.get(`/schedules/${username}`).then((resp) => resp.data);

export const removeSchedule = (username, id) => api.delete(`/schedules/${username}/${id}`);

export const moveSchedule = (id, username) => api.put(`/schedules/${username}/${id}`);

// Old image service
// Images

export const getImages = (username) => api.get(`api/images/${username}`).then((resp) => resp.data);

export const addMyImage = (user, url) =>
  api.post('/image', {
    username: user,
    image_url: url,
  });

export const uploadImage = (media, username, sign) => {
  const file = {
    uri: media.path,
    type: media.mime,
    name: media.filename || `img_${Math.random()}.jpg`,
    size: media.size,
  };

  const fData = new FormData();
  fData.append('file', file);

  return upload(fData, username, sign);
};

// New image service

// export const uploadImage = (username, signature, data) => new Promise((resolve, reject) => {
//   const fData = new FormData();
//   fData.append('postimage', data);
//   imageApi
//     .post(`${username}/${signature}`, data)
//     .then((res) => {
//       resolve(res.data);
//     })
//     .catch((error) => {
//       reject(error);
//     });
// });

export const getNodes = () => serverList.get().then((resp) => resp.data.hived || SERVER_LIST);

export const getSCAccessToken = (code) =>
  new Promise((resolve, reject) => {
    ecencyApi
      .post('/hs-token-refresh', {
        code,
      })
      .then((resp) => resolve(resp.data))
      .catch((e) => reject(e));
  });

export const getPromotePosts = () => {
  try {
    return api.get('/promoted-posts?limit=10').then((resp) => resp.data);
  } catch (error) {
    return error;
  }
};

export const purchaseOrder = (data) => api.post('/purchase-order', data).then((resp) => resp.data);

export const getPostReblogs = (data) =>
  api
    .get(`/post-reblogs/${data.author}/${data.permlink}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

export const register = (data) =>
  api.post('/signup/account-create', data).then((resp) => resp.data);
