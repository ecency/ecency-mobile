import {
  LOGIN, LOGOUT, OPEN_PIN_CODE_MODAL, CLOSE_PIN_CODE_MODAL,
} from '../constants/constants';

export const login = () => ({
  type: LOGIN,
});

export const logout = () => ({
  type: LOGOUT,
});

export const openPinCodeModal = () => ({
  type: OPEN_PIN_CODE_MODAL,
});

export const closePinCodeModal = () => ({
  type: CLOSE_PIN_CODE_MODAL,
});
