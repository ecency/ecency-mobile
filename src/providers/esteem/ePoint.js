import ePointApi from '../../config/ePoint';

export const userActivity = (username, type, blockNumber = '', transactionNumber = '') => {
  const params = { username, type };

  if (blockNumber) {
    params.blockNumber = blockNumber;
  }

  if (transactionNumber) {
    params.transactionNumber = transactionNumber;
  }

  try {
    return ePointApi.post('/usr-activity', params).then(res => res.data);
  } catch (error) {
    return null;
  }
};

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
    .get(`/users/:${username}`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      reject(error);
    });
});

export const getUserPoints = username => new Promise((resolve, reject) => {
  ePointApi
    .get(`/users/:${username}/points`)
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
