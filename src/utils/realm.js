import { getUserData, getAuthStatus } from '../realm/realm';

export const getUserIsLoggedIn = () => {
  getAuthStatus()
    .then(res => res)
    .catch(() => null);
};

export const getUserDataFromRealm = () => {
  getUserData()
    .then((res) => {
      userData = Array.from(res);
    })
    .catch(() => null);
};
