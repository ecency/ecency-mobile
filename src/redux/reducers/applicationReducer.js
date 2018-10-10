import { LOGIN, LOGOUT } from '../constants/constants';

const initialState = {
  isLoggedIn: false, // Has any logged in user.
  loading: false, // It is lock to all screen and shows loading animation.
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isLoggedIn: true,
      };
    case LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
      };

    default:
      return state;
  }
}
