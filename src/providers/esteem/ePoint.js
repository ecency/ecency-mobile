import ePointApi from '../../config/ePoint';

export const userActivity = (us, ty, bl = '', tx = '') => new Promise((resolve, reject) => {
  const params = { us, ty };

  if (bl) {
    params.bl = bl;
  }

  if (tx) {
    params.tx = tx;
  }

  ePointApi
    .post('/usr-activity', params)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const transfer = (sender, receiver, amount) => new Promise((resolve, reject) => {
  ePointApi
    .post('/transfer', {
      se: sender,
      re: receiver,
      am: amount,
    })
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getUser = username => new Promise((resolve, reject) => {
  ePointApi
    .get(`/users/${username}`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getUserPoints = username => new Promise((resolve, reject) => {
  ePointApi
    .get(`/users/${username}/points`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const claim = username => new Promise((resolve, reject) => {
  ePointApi
    .put('/claim', {
      us: `${username}`,
    })
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});
