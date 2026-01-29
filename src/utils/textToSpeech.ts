/**
 * Utility functions for Text-to-Speech feature
 */

/**
 * Extracts plain text from a post for TTS reading
 * Removes markdown, HTML, links, and other non-readable content
 */
export const extractPlainTextForTTS = (post: any): string => {
  if (!post || !post.body) {
    return '';
  }

  let text = post.body;

  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');

  // Remove markdown images: ![alt](url)
  text = text.replace(/!\[.*?\]\(.*?\)/g, '');

  // Remove links but keep text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, ' ');

  // Remove markdown headers: ## Header -> Header
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove code blocks: ```code```
  text = text.replace(/```[\s\S]*?```/g, '');

  // Remove inline code: `code`
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove markdown bold/italic: **text** or *text* -> text
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');

  // Remove markdown strikethrough: ~~text~~ -> text
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // Remove horizontal rules: --- or ***
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove blockquotes: > text
  text = text.replace(/^>\s+/gm, '');

  // Remove HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Remove URLs
  text = text.replace(/https?:\/\/[^\s]+/g, '');

  // Remove extra whitespace and newlines
  text = text.replace(/\s+/g, ' ').trim();

  // Add natural pauses after sentences for better TTS flow
  text = text.replace(/\.\s+/g, '. ... ');
  text = text.replace(/\?\s+/g, '? ... ');
  text = text.replace(/!\s+/g, '! ... ');

  return text;
};

/**
 * Check if post has readable text content
 */
export const hasReadableContent = (post: any): boolean => {
  const text = extractPlainTextForTTS(post);
  // Require at least 10 characters of text
  return text.length >= 10;
};

/**
 * Get estimated reading time in seconds
 */
export const getEstimatedReadingTime = (post: any, wordsPerMinute: number = 150): number => {
  const text = extractPlainTextForTTS(post);
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return 0;
  }

  const wordCount = trimmedText.split(/\s+/).filter(Boolean).length;
  return Math.ceil((wordCount / wordsPerMinute) * 60);
};

/**
 * Format reading time for display
 */
export const formatReadingTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
};
