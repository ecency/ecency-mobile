import api from '../../config/api';

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
  api
    .get(`/activities/${data.user}`, {
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
      resolve(res.data.count);
    })
    .catch((error) => {
      reject(error);
    });
});
