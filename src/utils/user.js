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

export const getName = (account) => {
  if (Object.keys(account).length === 0) return account.name;
  if (Object.keys(account.about).length === 0) return account.name;
  if (Object.keys(account.about.profile).length !== 0) {
    return account.about.profile.name;
  }
  return account.name;
};

export const getAvatar = (account) => {
  if (Object.keys(account).length === 0) return null;
  if (Object.keys(account.about).length === 0) return null;
  if (Object.keys(account.about.profile).length !== 0) {
    return account.about.profile.profile_image;
  }
  return null;
};
