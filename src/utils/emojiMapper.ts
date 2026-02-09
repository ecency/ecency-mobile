import emojiMap from '../constants/emojiMap.json';

// Cache reverse mapping: Unicode → Mattermost name
let reverseMapCache: Record<string, string> | null = null;

const getReverseEmojiMap = (): Record<string, string> => {
  if (reverseMapCache) {
    return reverseMapCache;
  }

  const reverse: Record<string, string> = {};
  Object.entries(emojiMap).forEach(([name, unicode]) => {
    // Handle duplicates: prefer shorter names
    if (!reverse[unicode] || name.length < reverse[unicode].length) {
      reverse[unicode] = name;
    }
  });

  reverseMapCache = reverse;
  return reverse;
};

/**
 * Convert Unicode emoji to Mattermost emoji name
 * @param unicode - Unicode emoji string (e.g., "👍")
 * @returns Mattermost emoji name (e.g., "+1")
 */
export const unicodeToMattermost = (unicode: string): string => {
  const reverseMap = getReverseEmojiMap();
  return reverseMap[unicode] || unicode;
};

/**
 * Convert Mattermost emoji name to Unicode emoji
 * @param name - Mattermost emoji name (e.g., "+1")
 * @returns Unicode emoji string (e.g., "👍")
 */
export const mattermostToUnicode = (name: string): string => {
  return emojiMap[name as keyof typeof emojiMap] || name;
};
