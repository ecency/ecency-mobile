import { getUserData, getAuthStatus } from "../realm/realm";

export const getUserIsLoggedIn = () => {
  getAuthStatus()
    .then(res => {
      return res;
    })
    .catch(() => {
      return null;
    });
};

export const getUserDataFromRealm = () => {
  getUserData()
    .then(res => {
      userData = Array.from(res);
    })
    .catch(() => {
      return null;
    });
};
