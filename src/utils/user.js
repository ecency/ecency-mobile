export const getReputation = (input) => {
  if (input === 0) {
    return 25;
  }

  if (!input) {
    return input;
  }

  let neg = false;

  if (input < 0) neg = true;

  let reputationLevel = Math.log10(Math.abs(input));
  reputationLevel = Math.max(reputationLevel - 9, 0);

  if (reputationLevel < 0) reputationLevel = 0;

  if (neg) reputationLevel *= -1;

  reputationLevel = reputationLevel * 9 + 25;

  return Math.floor(reputationLevel);
};
/* eslint-disable */
export const getName = about => {
  if (about['profile'] && about['profile']['name']) {
    return about['profile']['name'];
  }
  return null;
};

export const getAvatar = about => {
  if (about['profile'] && about['profile']['profile_image']) {
    return about['profile']['profile_image'];
  }
  return null;
};

export const validateUsername = username => {
  const usernameRegex = /^[a-zA-Z0-9]+$/g;

  return usernameRegex.test(username)
};
