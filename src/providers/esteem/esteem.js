import api from '../../config/api';
import searchApi from '../../config/search';
import imageApi from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import { jsonStringify } from '../../utils/jsonUtils';

export const getCurrencyRate = currency =>
  api.get(`/currencyRate/${currency.toUpperCase()}/steem`).then(resp => resp.data);

/**
 * @params username
 */
export const getDrafts = data =>
  new Promise((resolve, reject) => {
    api
      .get(`/drafts/${data}`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

/**
 * @params username
 * @params draftID
 */
export const removeDraft = (username, id) =>
  new Promise((resolve, reject) => {
    api
      .delete(`/drafts/${username}/${id}`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

/**
 * @params username
 * @params body
 * @params title
 * @params tags
 */
export const addDraft = data =>
  new Promise((resolve, reject) => {
    api
      .post('/draft', data)
      .then(res => {
        const { drafts } = res.data;
        resolve(drafts.pop());
      })
      .catch(error => {
        reject(error);
      });
  });

/**
 * @params username
 * @params body
 * @params title
 * @params tags
 */
export const updateDraft = data =>
  new Promise((resolve, reject) => {
    api
      .put(`/drafts/${data.username}/${data.draftId}`, {
        title: data.title,
        body: data.body,
        tags: data.tags,
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const addBookmark = (username, author, permlink) =>
  api
    .post('/bookmark', {
      username,
      author,
      permlink,
      chain: 'steem',
    })
    .then(resp => resp.data);

/**
 * @params current username
 */
export const getBookmarks = username => api.get(`/bookmarks/${username}`).then(resp => resp.data);

/**
 * @params id
 * @params current username
 */
export const removeBookmark = (username, id) => api.delete(`/bookmarks/${username}/${id}`);

/**
 * @params current username
 */
export const getFavorites = username => api.get(`/favorites/${username}`).then(resp => resp.data);

/**
 * @params current username
 * @params target username
 */
export const getIsFavorite = (targetUsername, currentUsername) =>
  api.get(`/isfavorite/${currentUsername}/${targetUsername}`).then(resp => resp.data);

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
    .then(resp => resp.data);

/**
 * @params current username
 * @params target username
 */
export const removeFavorite = (currentUsername, targetUsername) =>
  api.delete(`/favoriteUser/${currentUsername}/${targetUsername}`);

export const getLeaderboard = () => api.get('/leaderboard').then(resp => resp.data);

export const getActivities = data =>
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
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const getUnreadActivityCount = data =>
  new Promise((resolve, reject) => {
    api
      .get(`/activities/${data.user}/unread-count`)
      .then(res => {
        resolve(res.data ? res.data.count : 0);
      })
      .catch(error => {
        reject(error);
      });
  });

export const markActivityAsRead = (user, id = null) =>
  new Promise((resolve, reject) => {
    api
      .put(`/activities/${user}`, { id })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const setPushToken = data =>
  new Promise((resolve, reject) => {
    api
      .post('/rgstrmbldvc/', data)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

// SEARCH API

export const search = data =>
  new Promise((resolve, reject) => {
    searchApi
      .post('/search', data)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
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
) =>
  api
    .post('/schedules', {
      username: user,
      category: tags[0],
      title,
      permlink,
      json: jsonStringify(json),
      tags,
      body,
      post_type: operationType,
      upvote_this: upvote,
      schedule: scheduleDate,
      chain: 'steem',
    })
    .then(resp => resp.data);

export const getSchedules = username => api.get(`/schedules/${username}`).then(resp => resp.data);

export const removeSchedule = (username, id) => api.delete(`/schedules/${username}/${id}`);

export const moveSchedule = (id, username) => api.put(`/schedules/${username}/${id}`);

// Old image service
// Images

export const getImages = username => api.get(`api/images/${username}`).then(resp => resp.data);

export const addMyImage = (user, url) => api.post('/image', { username: user, image_url: url });

export const uploadImage = file => {
  const fData = new FormData();
  fData.append('postimage', file);

  return imageApi.post('', fData);
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

export const getNodes = () => serverList.get().then(resp => resp.data.nodes);

export const getSCAccessToken = code =>
  new Promise(resolve => {
    api.post('/sc-token-refresh', { code }).then(resp => resolve(resp.data));
  });
