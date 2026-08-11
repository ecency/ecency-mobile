import React from 'react';
import { Platform, Text } from 'react-native';
import moment from 'moment';
import { emojifyMessage } from '../../../utils/emoji';
import { mattermostToUnicode } from '../../../utils/emojiMapper';
import { extractImageUrls } from '../../../utils/editor';
import { getHiveUsernameFromMattermostUser } from '../../../providers/chat/mattermost';
import { InlineSpan, parseInlineMarkdown } from './inlineMarkdown';

export interface ChatPost {
  id?: string;
  message?: string;
  user_id?: string;
  user?: { username?: string; nickname?: string; name?: string };
  create_at?: number;
  update_at?: number;
  edit_at?: number;
  props?: any;
  type?: string;
  text?: string;
  root_id?: string;
  metadata?: { reactions?: any[] };
}

export interface AddedUserInfo {
  addedUserId?: string;
  addedUsername?: string;
  normalizedUsername?: string | null;
}

export interface ParsedMessageContent {
  text: string;
  images: string[];
}

/**
 * Get added user info from system message
 */
export const getAddedUserInfo = (
  post: ChatPost,
  userLookup: Record<string, any>,
): AddedUserInfo => {
  const addedUserId =
    (post?.props as any)?.addedUserId ||
    (post?.props as any)?.userId ||
    (post?.props as any)?.added_user_id ||
    (post?.props as any)?.user_id;
  const addedUsername =
    (post?.props as any)?.addedUsername ||
    (post?.props as any)?.username ||
    (addedUserId &&
      (userLookup[addedUserId]?.hiveUsername ||
        getHiveUsernameFromMattermostUser(userLookup[addedUserId])));

  const normalizedUsername = addedUsername
    ? addedUsername.startsWith('@')
      ? addedUsername
      : `@${addedUsername}`
    : null;

  return {
    addedUserId,
    addedUsername,
    normalizedUsername,
  };
};

/**
 * Format joined message for system messages
 */
export const formatJoinedMessage = (
  post: ChatPost,
  userLookup: Record<string, any>,
  timestamp?: number,
): string => {
  const { normalizedUsername } = getAddedUserInfo(post, userLookup);

  if (normalizedUsername) {
    if (timestamp) {
      const duration = moment.duration(moment().diff(moment(timestamp)));
      const timeAgo = duration.humanize();
      return `${normalizedUsername} joined ${timeAgo} ago`;
    }
    return `${normalizedUsername} joined`;
  }

  return post.message || post.props?.message || post.text || '';
};

/**
 * Format post body based on post type
 */
export const formatPostBody = (
  post: ChatPost,
  userLookup: Record<string, any>,
  timestamp?: number,
): string => {
  if (
    post?.type === 'system_add_to_channel' ||
    post?.type === 'system_add_to_team' ||
    post?.type === 'system_join_team' ||
    post?.type === 'system_join_channel'
  ) {
    return formatJoinedMessage(post, userLookup, timestamp);
  }

  return post.message || post.props?.message || post.text || '';
};

/**
 * Parse message content to extract images and format text
 */
export const parseMessageContent = (
  rawMessage: string,
  parseMentionUrl = true,
): ParsedMessageContent => {
  const imageLinks = extractImageUrls({ body: rawMessage });

  let textNoImages = rawMessage;
  if (imageLinks && Array.isArray(imageLinks) && imageLinks.length > 0) {
    imageLinks.forEach((imgUrl) => {
      textNoImages = textNoImages.replace(new RegExp(`!\\[.*?\\]\\(${imgUrl}\\)`, 'g'), '');
      textNoImages = textNoImages.replace(new RegExp(`\\[.*?\\]\\(${imgUrl}\\)`, 'g'), '');
      textNoImages = textNoImages.replace(new RegExp(imgUrl, 'g'), '');
    });
  }

  if (parseMentionUrl) {
    const hasExistingProfileLinks = /\/@([a-zA-Z0-9\-.]+)/.test(textNoImages);

    if (!hasExistingProfileLinks) {
      textNoImages = textNoImages
        .split(' ')
        .map((word) => {
          if (word.match(/^https?:\/\//)) {
            return word;
          }
          return word.replace(/^@([a-zA-Z0-9\-.]+)/, 'https://ecency.com/@$1');
        })
        .join(' ');
    }
  }

  const cleanedText = textNoImages.trim();
  const emojifiedText = emojifyMessage(cleanedText);

  return {
    text: emojifiedText,
    images: imageLinks,
  };
};

/**
 * Get emoji display character from name
 */
export const getEmojiDisplay = (emojiName: string): string => {
  return mattermostToUnicode(emojiName);
};

/**
 * Set custom link text for Ecency profile URLs
 */
export const setLinkText = (url: string): string => {
  const ecencyUserPattern = /^https:\/\/ecency\.com\/@([a-zA-Z0-9\-.]+)\/?$/;
  const match = url.match(ecencyUserPattern);
  if (match) {
    const username = match[1];
    return `@${username}`;
  }
  return url;
};

/**
 * Render text with bold @mentions (returns React elements)
 */
const spanStyle = (span: InlineSpan) => {
  const style: any = {};
  if (span.bold) {
    style.fontWeight = '700';
  }
  if (span.italic) {
    style.fontStyle = 'italic';
  }
  if (span.strike) {
    style.textDecorationLine = 'line-through';
  }
  if (span.code) {
    style.fontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
  }
  return style;
};

/**
 * Applies inline markdown to one run of non-mention text.
 *
 * Anything covered by a linkify range is passed through as a raw string: the surrounding
 * <Hyperlink> matches on the rendered text, so splitting a URL into styled <Text> nodes would
 * stop it being tappable, and a URL containing "_" or "*" could otherwise be reformatted into
 * something that no longer resolves.
 */
const renderSegmentWithMarkdown = (
  text: string,
  absoluteStart: number,
  linkRanges: Array<{ start: number; end: number }>,
  textStyle: any,
  keyPrefix: string,
): React.ReactNode[] => {
  const absoluteEnd = absoluteStart + text.length;
  const overlapping = linkRanges
    .filter((r) => r.end > absoluteStart && r.start < absoluteEnd)
    .sort((a2, b2) => a2.start - b2.start);

  const nodes: React.ReactNode[] = [];
  let cursor = absoluteStart;

  const pushFormatted = (from: number, to: number) => {
    const slice = text.slice(from - absoluteStart, to - absoluteStart);
    if (!slice) {
      return;
    }
    parseInlineMarkdown(slice).forEach((span, i) => {
      if (!span.bold && !span.italic && !span.strike && !span.code) {
        nodes.push(span.text);
        return;
      }
      nodes.push(
        // eslint-disable-next-line react/no-array-index-key
        <Text key={`${keyPrefix}md${from}_${i}`} style={[textStyle, spanStyle(span)]}>
          {span.text}
        </Text>,
      );
    });
  };

  overlapping.forEach((range) => {
    const linkStart = Math.max(range.start, absoluteStart);
    const linkEnd = Math.min(range.end, absoluteEnd);
    if (linkStart > cursor) {
      pushFormatted(cursor, linkStart);
    }
    // raw string: leave the URL exactly as typed for <Hyperlink>
    nodes.push(text.slice(linkStart - absoluteStart, linkEnd - absoluteStart));
    cursor = linkEnd;
  });

  if (cursor < absoluteEnd) {
    pushFormatted(cursor, absoluteEnd);
  }

  return nodes;
};

export const renderTextWithBoldMentions = (
  text: string,
  textStyle: any,
  linkifyInstance: any,
): React.ReactNode => {
  const links = linkifyInstance.match(text) || [];
  const linkRanges: Array<{ start: number; end: number }> = links.map((link: any) => ({
    start: link.index,
    end: link.index + link.raw.length,
  }));

  const mentionPattern = /(^|[\s\n])(@[a-zA-Z0-9\-.]+)/g;
  // `start` is the absolute offset into `text`, needed so inline markdown can be skipped
  // wherever a linkify range covers the run.
  const parts: Array<{ text: string; isMention: boolean; start: number }> = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    const fullMatch = match[0];
    const beforeChar = match[1];
    const mention = match[2];
    const mentionStart = match.index + beforeChar.length;
    const mentionEnd = mentionStart + mention.length;

    const isInsideLink = linkRanges.some(
      (range) => mentionStart >= range.start && mentionEnd <= range.end,
    );

    if (match.index > lastIndex) {
      parts.push({ text: text.slice(lastIndex, match.index), isMention: false, start: lastIndex });
    }

    if (beforeChar) {
      parts.push({ text: beforeChar, isMention: false, start: match.index });
    }

    parts.push({ text: mention, isMention: !isInsideLink, start: mentionStart });

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex), isMention: false, start: lastIndex });
  }

  // No mentions is the common case, and it still needs inline markdown applied.
  if (parts.length === 0) {
    return renderSegmentWithMarkdown(text, 0, linkRanges, textStyle, 'p');
  }

  return parts.map((part, index) => {
    if (part.isMention) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <Text key={`mention${index}`} style={[textStyle, { fontWeight: '700' }]}>
          {part.text}
        </Text>
      );
    }
    return renderSegmentWithMarkdown(part.text, part.start, linkRanges, textStyle, `s${index}_`);
  });
};
