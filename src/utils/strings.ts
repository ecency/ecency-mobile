/**
 * converts keys like comments_curationRewards into Comments Curation Reward
 * @param key intl key of format comments_curationRewards
 * @returns formated human readable string
 */

export const getHumanReadableKeyString = (intlKey: string) => {
  const words = intlKey.split('_');
  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0).toUpperCase();
    const remainingLetters = word.slice(1).replace(/([A-Z])/g, ' $1');
    return firstLetter + remainingLetters;
  });
  return capitalizedWords.join(' ');
};
