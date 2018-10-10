import { LOGIN, LOGOUT } from '../constants/constants';

export const login = () => ({
  type: LOGIN,
});

export const logout = () => ({
  type: LOGOUT,
});
