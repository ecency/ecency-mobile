import Navigator from '../../navigation/routes';

export default (state, action) => {
  const newState = Navigator.router.getStateForAction(action, state);
  return newState || state;
};
