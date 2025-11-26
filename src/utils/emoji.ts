import emojiMap from '../constants/emojiMap.json';

type EmojiLookup = Record<string, string>;

const EMOJI_REGEX = /:([a-zA-Z0-9_+\-]+):/g;

export const emojifyMessage = (message: string): string => {
  if (!message) {
    return '';
  }

  const lookup = emojiMap as EmojiLookup;

  return message.replace(EMOJI_REGEX, (match, name) => {
    const normalizedName = name.toLowerCase();
    const emoji = lookup[normalizedName];
    return emoji || match;
  });
};
