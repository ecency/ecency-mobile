import Navigator from '../../config/routes';

export default (state, action) => {
  const newState = Navigator.router.getStateForAction(action, state);
  return newState || state;
};
