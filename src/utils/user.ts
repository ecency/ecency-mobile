const isHumanReadable = (input: number): boolean => {
  return Math.abs(input) > 0 && Math.abs(input) <= 100;
};

export const parseReputation = (input: string | number): number => {
  if (typeof input === 'number' && isHumanReadable(input)) {
    return Math.floor(input);
  }

  if (typeof input === 'string') {
    input = Number(input);

    if (isHumanReadable(input)) {
      return Math.floor(input);
    }
  }

  if (input === 0) {
    return 25;
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

export const getName = (about) => {
  if (about.profile && about.profile.name) {
    return about.profile.name;
  }
  return null;
};

export const getAvatar = (about) => {
  if (about.profile && about.profile.profile_image) {
    return about.profile.profile_image;
  }
  return null;
};

export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9]+$/g;

  return usernameRegex.test(username);
};
