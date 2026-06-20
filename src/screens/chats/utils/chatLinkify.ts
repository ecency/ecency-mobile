import type LinkifyIt from 'linkify-it';

// hive-uri links look like `hive://sign/op/<payload>` (also tx/ops/msg). The
// payload is a custom base64 that can end in `.` (its `=` padding), so the tail
// is matched as everything up to whitespace rather than trimming punctuation.
const HIVE_URI_TAIL = /^\/\/[^\s<>"]+/;

/**
 * Register the `hive:` scheme on a linkify-it instance so hive-uri signing
 * links (hive://sign/op/...) are detected and become tappable in chat
 * messages, the same as http/https links. Returns the same instance.
 */
export const addHiveScheme = (linkify: LinkifyIt.LinkifyIt) => {
  linkify.add('hive:', {
    validate: (text: string, pos: number) => {
      const tail = text.slice(pos);
      const match = tail.match(HIVE_URI_TAIL);
      return match ? match[0].length : 0;
    },
  });
  return linkify;
};
