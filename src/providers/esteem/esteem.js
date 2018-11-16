import api from '../../config/api';

const testData = [
  {
    id: 'm-32364653',
    type: 'mention',
    source: 'future24',
    author: 'future24',
    account: 'mistikk',
    permlink: 'my-steemfest-badget-scan-collection-meet-the-steemians-contest-d40b4dc68fd1eest',
    post: true,
    read: 0,
    timestamp: '2018-11-15T12:33:57+00:00',
    ts: 1542281637,
    gk: '2 hours',
    gkf: true,
  },
  {
    id: 'm-32364257',
    type: 'mention',
    source: 'future24',
    author: 'future24',
    account: 'mistikk',
    permlink: 'my-steemfest-badget-scan-collection-meet-the-steemians-contest-d40b4dc68fd1eest',
    post: true,
    read: 0,
    timestamp: '2018-11-15T12:17:57+00:00',
    ts: 1542280677,
    gk: '2 hours',
    gkf: false,
  },
  {
    id: 'f-165464166',
    type: 'follow',
    source: 'manncpt',
    follower: 'manncpt',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-11-13T23:07:18+00:00',
    ts: 1542146838,
    gk: '2018-11-13',
    gkf: true,
  },
  {
    id: 'f-165459364',
    type: 'follow',
    source: 'future24',
    follower: 'future24',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-11-13T15:37:06+00:00',
    ts: 1542119826,
    gk: '2018-11-13',
    gkf: false,
  },
  {
    id: 'm-32222130',
    type: 'mention',
    source: 'steemium',
    author: 'steemium',
    account: 'mistikk',
    permlink: 'early-access-to-steemium-for-all-steemfest-participants',
    post: true,
    read: 0,
    timestamp: '2018-11-11T02:56:48+00:00',
    ts: 1541901408,
    gk: '2018-11-11',
    gkf: true,
  },
  {
    id: 'm-32213631',
    type: 'mention',
    source: 'louis88',
    author: 'louis88',
    account: 'mistikk',
    permlink: 'beersaturday-is-on-great-and-the-esteem-joined-e63f0a592fa2e',
    post: true,
    read: 0,
    timestamp: '2018-11-10T19:58:21+00:00',
    ts: 1541876301,
    gk: '2018-11-10',
    gkf: true,
  },
  {
    id: 'm-31826288',
    type: 'mention',
    source: 'u-e',
    author: 'u-e',
    account: 'mistikk',
    permlink: 'test-with-user-id-2worq984zaa',
    post: true,
    read: 0,
    timestamp: '2018-10-29T21:46:18+00:00',
    ts: 1540845978,
    gk: '2018-10-29',
    gkf: true,
  },
  {
    id: 'f-164966801',
    type: 'follow',
    source: 'marcusmalone',
    follower: 'marcusmalone',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-10-25T03:45:45+00:00',
    ts: 1540431945,
    gk: '2018-10-25',
    gkf: true,
  },
  {
    id: 'f-164533994',
    type: 'follow',
    source: 'cahitihac',
    follower: 'cahitihac',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-10-14T08:49:36+00:00',
    ts: 1539499776,
    gk: '2018-10-14',
    gkf: true,
  },
  {
    id: 'f-164336256',
    type: 'follow',
    source: 'horpey',
    follower: 'horpey',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-10-08T23:05:30+00:00',
    ts: 1539032730,
    gk: '2018-10-08',
    gkf: true,
  },
  {
    id: 'f-147167566',
    type: 'follow',
    source: 'okankarol',
    follower: 'okankarol',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-09-09T05:27:21+00:00',
    ts: 1536463641,
    gk: '2018-09-09',
    gkf: true,
  },
  {
    id: 'f-147167446',
    type: 'follow',
    source: 'obaku',
    follower: 'obaku',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-09-09T05:26:48+00:00',
    ts: 1536463608,
    gk: '2018-09-09',
    gkf: false,
  },
  {
    id: 'f-147167414',
    type: 'follow',
    source: 'raise-me-up',
    follower: 'raise-me-up',
    following: 'mistikk',
    blog: true,
    read: 0,
    timestamp: '2018-09-09T05:26:45+00:00',
    ts: 1536463605,
    gk: '2018-09-09',
    gkf: false,
  },
];

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
  resolve(testData);
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
