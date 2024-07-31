const extractHashTags = (text: string) => {
  // Regex pattern for hashtags
  const pattern = /#(\w+)/g;
  // Find all hashtags and discard the # character
  const hashtags = [];
  let match;

  while ((match = pattern.exec(text)) !== null) {
    hashtags.push(match[1]); // match[1] contains the hashtag without the #
  }

  return hashtags;
};

export default extractHashTags;
