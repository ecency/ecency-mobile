import api from '../../config/api';
import searchApi from '../../config/search';

export const getDrafts = data => new Promise((resolve, reject) => {
  api
    .get(`/drafts/${data.user}`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const removeDraft = data => new Promise((resolve, reject) => {
  api
    .delete(`/drafts/${data.user}/${data.draftId}`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const addDraft = data => new Promise((resolve, reject) => {
  api
    .post('/draft', data)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const updateDraft = data => new Promise((resolve, reject) => {
  api
    .put(`/drafts/${data.user}/${data.draftId}`, data)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getActivities = data => new Promise((resolve, reject) => {
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
      reject(error);
    });
});

export const getUnreadActivityCount = data => new Promise((resolve, reject) => {
  api
    .get(`/activities/${data.user}/unread-count`)
    .then((res) => {
      resolve(res.data?res.data.count:0);
    })
    .catch((error) => {
      reject(error);
    });
});

export const search = data => new Promise((resolve, reject) => {
  searchApi
    .post('/search', data)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});
