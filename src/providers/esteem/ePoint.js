import { Alert } from 'react-native';
import ePointApi from '../../config/ePoint';

<<<<<<< HEAD
export const userActivity = (us, ty, bl = '', tx = '') =>
  new Promise((resolve, reject) => {
    const params = { us, ty };
=======
export const userActivity = (us, ty, bl = '', tx = '') => new Promise((resolve) => {
  const params = { us, ty };
>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945

    if (bl) {
      params.bl = bl;
    }

    if (tx) {
      params.tx = tx;
    }

<<<<<<< HEAD
    ePointApi
      .post('/usr-activity', params)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const transfer = (sender, receiver, amount) =>
  new Promise((resolve, reject) => {
    ePointApi
      .post('/transfer', {
        se: sender,
        re: receiver,
        am: amount,
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const getUser = username =>
  new Promise((resolve, reject) => {
    ePointApi
      .get(`/users/${username}`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const getUserPoints = username =>
  new Promise((resolve, reject) => {
    ePointApi
      .get(`/users/${username}/points`)
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });

export const claim = username =>
  new Promise((resolve, reject) => {
    ePointApi
      .put('/claim', {
        us: `${username}`,
      })
      .then(res => {
        resolve(res.data);
      })
      .catch(error => {
        reject(error);
      });
  });
=======
  ePointApi
    .post('/usr-activity', params)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      Alert.alert('Error', error.message);
    });
});

export const transfer = (sender, receiver, amount) => new Promise((resolve) => {
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
      Alert.alert('Error', error.message);
    });
});

export const getUser = username => new Promise((resolve) => {
  ePointApi
    .get(`/users/${username}`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      Alert.alert('Error', error.message);
    });
});

export const getUserPoints = username => new Promise((resolve) => {
  ePointApi
    .get(`/users/${username}/points`)
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      Alert.alert('Error', error.message);
    });
});

export const claim = username => new Promise((resolve) => {
  ePointApi
    .put('/claim', {
      us: `${username}`,
    })
    .then((res) => {
      resolve(res.data);
    })
    .catch((error) => {
      Alert.alert('Error', error.message);
    });
});
>>>>>>> 3bd23bb1faf32382b70b2851b200099e6dd0b945
