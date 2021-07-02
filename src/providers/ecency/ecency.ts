import api from '../../config/api';
import ecencyApi from '../../config/ecencyApi';
import searchApi from '../../config/search';
import { upload } from '../../config/imageApi';
import serverList from '../../config/serverListApi';
import bugsnag from '../../config/bugsnag';
import { SERVER_LIST } from '../../constants/options/api';
import { parsePost } from '../../utils/postParser';

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
 * returns list of saved drafts on ecency server
 */
export const getDrafts = async () => {
  try{
    const res = await ecencyApi.post('/private-api/drafts');
    return res.data;
  }catch(error){
    bugsnag.notify(error);
    throw error;
  }
}
  


/**
 * @params draftId
 */
export const removeDraft = async (draftId:string) => {
  try{
    const data = { id:draftId }
    const res = await ecencyApi.post(`/private-api/drafts-delete`, data);
    return res.data
  }catch(error){
    bugsnag.notify(error);
    throw error;
  }
}


/**
 * @params title
 * @params body
 * @params tags
 */
export const addDraft = async (title:string, body:string, tags:string) => {
  try {
    const data = { title, body, tags }
    const res = await ecencyApi.post('/private-api/drafts-add', data)
    const { drafts } = res.data;
    if (drafts) {
      return drafts.pop(); //return recently saved last draft in the list
    } else {
      throw new Error('No drafts returned in response');
    }
  } catch(error){
    bugsnag.notify(error);
    throw error;
  }
}


/**
 * @params draftId
 * @params title
 * @params body
 * @params tags
 */
export const updateDraft = async (draftId:string, title:string, body:string, tags:string) => {
  try {
    const data = {id:draftId, title, body, tags }
    const res = await ecencyApi.post(`/private-api/drafts-update`, data)
    if(res.data){
      return res.data
    } else {
      throw new Error("No data returned in response")
    }
  } catch(error){
    bugsnag.notify(error);
    throw error;
  }
};



export const addBookmark = (username, author, permlink) =>
  api
    .post('/bookmark', {
      username,
      author,
      permlink,
      chain: 'hive',
    })
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

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
  api
    .get(`/bookmarks/${username}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

/**
 * @params id
 * @params current username
 */
export const removeBookmark = (username, id) => api.delete(`/bookmarks/${username}/${id}`);

/**
 * @params current username
 */
export const getFavorites = (username) =>
  api
    .get(`/favorites/${username}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

/**
 * @params current username
 * @params target username
 */
export const getIsFavorite = (targetUsername, currentUsername) =>
  api
    .get(`/isfavorite/${currentUsername}/${targetUsername}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

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
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

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
  api
    .get(`/fragments/${username}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

/**
 * @params current username
 * @params title title
 * @params body body
 */
export const addSnippet = (currentUsername, title, body) =>
  api
    .post('/fragment', {
      username: currentUsername,
      title,
      body,
    })
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

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


  export const getUnreadNotificationCount = async () => {
    try {
      const response = await ecencyApi.post(`/private-api/notifications/unread`)
      return response.data ? response.data.count : 0;
    } catch(error) {
      bugsnag.notify(error);
      throw error;
    }
  }

  export const markNotifications = async (id: string | null = null) => {
    try{
      const data = id ? { id } : {};
      const response = await ecencyApi.post((`/private-api/notifications/mark`), data);
      return response.data
    }catch(error) {
      bugsnag.notify(error);
      throw error
    }
  };


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



/** 
 * ************************************
 * SCHEDULES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */

/**
 * Adds new post to scheduled posts
 * @param permlink 
 * @param title 
 * @param body 
 * @param meta 
 * @param options 
 * @param scheduleDate 
 * @returns All scheduled posts
 */
export const addSchedule = async (
  permlink:string,
  title:string,
  body:string,
  meta:any,
  options:any,
  scheduleDate:string
) => {
  try {
    const data = {
      title,
      permlink,
      meta,
      body,
      schedule: scheduleDate,
      options,
      reblog: 0,
    }
    const response = await ecencyApi
    .post('/private-api/schedules-add', data)
    return response.data;
  } catch(error) {
    console.warn("Failed to add post to schedule", error)
    bugsnag.notify(error);
    throw error;
  }
}

/**
 * Fetches all scheduled posts against current user
 * @returns array of app scheduled posts
 */
export const getSchedules = async () => {
  try {
    const response = await ecencyApi.post(`/private-api/schedules`)
    return response.data;
  } catch(error){
    console.warn("Failed to get schedules")
    bugsnag.notify(error)
    throw error;
  }
}

/**
 * Removes post from scheduled posts using post id;
 * @param id 
 * @returns array of scheduled posts
 */
export const deleteScheduledPost = async (id:string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post(`/private-api/schedules-delete`, data);
    return response;
  }catch(error){
    console.warn("Failed to delete scheduled post")
    bugsnag.notify(error)
    throw error;
  }
} 

/**
 * Moves scheduled post to draft using schedule id
 * @param id 
 * @returns Array of scheduled posts
 */
export const moveScheduledToDraft = async (id:string) => {
  try {
    const data = { id }
    const response = await ecencyApi.post(`/private-api/schedules-move`, data);
    return response.data;
  } catch(error) {
    console.warn("Failed to move scheduled post to drafts")
    bugsnag.notify(error)
    throw error;
  }
}

// Old image service
/** 
 * ************************************
 * IMAGES ECENCY APIS IMPLEMENTATION 
 * ************************************
 */


export const getImages = async () => {
  try {
    const response = await ecencyApi.post('/private-api/images')
    return response.data;
  } catch(error){
    console.warn('Failed to get images', error);
    bugsnag.notify(error);
  }
}

export const addImage = async (url:string) => {
  try {
    const data = { url };
    const response = await ecencyApi.post(`/private-api/images-add`, data);
    return response.data;
  } catch(error) {
    console.warn('Failed to add image', error);
    bugsnag.notify(error);
    throw error;
  }
}

export const deleteImage = async (id:string) => {
  try {
    const data = { id };
    const response = await ecencyApi.post(`/private-api/images-delete`, data);
    return response.data;
  } catch(error) {
    console.warn('Failed to delete image', error);
    bugsnag.notify(error);
    throw error;
  }
}

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
      .post('/auth-api/hs-token-refresh', {
        code,
      })
      .then((resp) => resolve(resp.data))
      .catch((e) => {
        bugsnag.notify(e);
        reject(e);
      });
  });

export const getPromotePosts = (username) => {
  try {
    console.log('Fetching promoted posts');
    return api.get('/promoted-posts?limit=10').then((resp) => {
      return resp.data.map(({ post_data }) =>
        post_data ? parsePost(post_data, username, true) : null,
      );
    });
  } catch (error) {
    bugsnag.notify(error);
    return error;
  }
};

export const purchaseOrder = (data) =>
  api
    .post('/purchase-order', data)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

export const getPostReblogs = (data) =>
  api
    .get(`/post-reblogs/${data.author}/${data.permlink}`)
    .then((resp) => resp.data)
    .catch((error) => bugsnag.notify(error));

export const register = async (data) => {
  try {
    const res = await api.post('/signup/account-create', data);
    return res.data;
  } catch (error) {
    bugsnag.notify(error);
    throw error;
  }
};
