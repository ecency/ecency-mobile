import axios from 'axios';
import api from '../../config/api';
import searchApi from '../../config/search';
import imageApi from '../../config/imageApi';

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
      resolve(res.data.count);
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
) => api
  .post('/api/schedules', {
    username: user,
    category: tags[0],
    title,
    permlink,
    json: JSON.stringify(json),
    tags,
    body,
    post_type: operationType,
    upvote_this: upvote,
    schedule: scheduleDate,
    chain: 'steem',
  })
  .then(resp => resp.data);

export const getSchedules = user => api.get(`/api/schedules/${user}`).then(resp => resp.data);

export const removeSchedule = (id, user) => api.delete(`/api/schedules/${user}/${id}`);

export const moveSchedule = (id, user) => api.put(`/api/schedules/${user}/${id}`);

// Old image service
// Images

// export const getImages = user => api.get(`api/images/${user}`).then(resp => resp.data);

// export const uploadImage = (file) => {
//   const fData = new FormData();
//   fData.append('postimage', file);

//   return api.post('https://img.esteem.ws/backend.php', fData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// export const uploadImage = data => new Promise((resolve, reject) => {
//   imageApi
//     .post(data)
//     .then((res) => {
//       resolve(res.data);
//       console.log(res);
//     })
//     .catch((error) => {
//       reject(error);
//       console.log(error);
//     });
// });

export const uploadImage = (file) => {
  const fData = new FormData();
  fData.append('postimage', file);

  return axios.post('https://img.esteem.ws/backend.php', fData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// New image service
// export const uploadImage = (username, signature, data) => new Promise((resolve, reject) => {
//   imageApi
//     .post(`${username}/${signature}`, data)
//     .then((res) => {
//       resolve(res.data);
//       console.log(res);
//     })
//     .catch((error) => {
//       reject(error);
//       console.log(error);
//       console.log(data.image_file);
//       console.log(signature);
//       console.log(username);
//     });
// });

// export const uploadImage = (username, signature, data) => {
//   const fData = new FormData();
//   fData.append('postimage', data);

//   return imageApi.post(`https://img.esteem.app/${username}/${signature}`, data, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });

// };

// export const addMyImage = (user, url) => api.post('/api/image', { username: user, image_url: url });
