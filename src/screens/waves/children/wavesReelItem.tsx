import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { ShortsFeedEntry } from '@ecency/sdk';

import { FormattedCurrency, Icon, UserAvatar } from '../../../components';
import { ProBadge } from '../../../components/proBadge';
import WavesReelVideo from './wavesReelVideo';
import styles from '../styles/wavesReels.styles';

interface Props {
  item: ShortsFeedEntry;
  height: number;
  active: boolean;
  onUpvotePress: (args: {
    content: any;
    sourceRef: React.RefObject<any>;
    onVotingStart: (status: number) => void;
  }) => void;
  onReplyPress: (content: any) => void;
  onTipPress: (content: any) => void;
}

// The reel already plays the video, so the caption is just the human text:
// drop markdown images, the 3Speak "watch" footer link, other markdown links
// (kept as their label), HTML tags (the composer appends videos as `text<br>url`)
// and bare URLs (e.g. the play.3speak.tv embed link the body carries).
function sanitizeCaptionText(value: string): string {
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\((?:https?:\/\/)?(?:play\.)?3speak[^)]*\)/gi, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/▶️?/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Clean title and body independently so a title that's only a URL/markdown
// (collapses to empty) falls back to the body text instead of a blank caption.
function buildReelCaption(item: ShortsFeedEntry): string {
  const caption = sanitizeCaptionText(item.title ?? '') || sanitizeCaptionText(item.body ?? '');
  return caption.slice(0, 140);
}

/**
 * One full-height reel: the 3Speak video plays only while the item is the one
 * in view (mounting every WebView at once would autoplay/load dozens of
 * videos), with the same upvote/reply/tip engagement as a wave card overlaid on
 * top. Inactive reels show the poster thumbnail with a play badge.
 */
const WavesReelItem = ({
  item,
  height,
  active,
  onUpvotePress,
  onReplyPress,
  onTipPress,
}: Props) => {
  const intl = useIntl();
  const upvoteRef = useRef<any>(null);
  const { video } = item;
  const itemIsUpVoted = !!(item as any).isUpVoted;

  // Local vote state for immediate feedback (the feed query only reconciles the
  // real vote on the 60s refetch), seeded from the parsed entry.
  const [isVoted, setIsVoted] = useState(itemIsUpVoted);
  useEffect(() => {
    setIsVoted(itemIsUpVoted);
  }, [itemIsUpVoted]);

  const caption = useMemo(() => buildReelCaption(item), [item]);

  const _onUpvote = () => {
    onUpvotePress({
      content: item,
      sourceRef: upvoteRef,
      onVotingStart: (status: number) => setIsVoted(status > 0),
    });
  };

  const payoutValue = Number((item as any).total_payout) || 0;

  return (
    <View style={[styles.reel, { height }]}>
      <View style={styles.videoLayer}>
        {active && video ? (
          <WavesReelVideo video={video} active={active} />
        ) : (
          <View style={styles.poster}>
            {video?.thumbnail_url ? (
              <Image source={{ uri: video.thumbnail_url }} style={styles.posterImage} />
            ) : (
              <View style={styles.posterFallback} />
            )}
            <View style={styles.playBadge}>
              <Icon iconType="AntDesign" name="playcircleo" style={styles.playIcon} />
            </View>
          </View>
        )}
      </View>

      {/* Author + caption (bottom-left). box-none so taps reach the video/rail
          except on the avatar/name themselves. */}
      <View style={styles.bottomOverlay} pointerEvents="box-none">
        <View style={styles.authorRow}>
          <UserAvatar username={item.author} />
          <Text style={styles.authorName}>@{item.author}</Text>
          <ProBadge username={item.author} />
        </View>
        {!!caption && (
          <Text style={styles.caption} numberOfLines={2}>
            {caption}
          </Text>
        )}
      </View>

      {/* Engagement rail (bottom-right) */}
      <View style={styles.rail}>
        <TouchableOpacity
          ref={upvoteRef}
          onPress={_onUpvote}
          style={styles.railBtn}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({ id: 'post.upvote', defaultMessage: 'Upvote' })}
        >
          <Icon
            iconType="AntDesign"
            name={isVoted ? 'upcircle' : 'upcircleo'}
            style={isVoted ? styles.railIconVoted : styles.railIcon}
          />
          <Text style={styles.railText}>
            <FormattedCurrency value={payoutValue} />
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onReplyPress(item)}
          style={styles.railBtn}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({
            id: 'post.a11y_reply_hint',
            defaultMessage: 'Reply',
          })}
        >
          <Icon iconType="MaterialCommunityIcons" name="comment-outline" style={styles.railIcon} />
          <Text style={styles.railText}>{(item as any).children || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onTipPress(item)}
          style={styles.railBtn}
          accessibilityRole="button"
          accessibilityLabel={intl.formatMessage({
            id: 'post.a11y_tip',
            defaultMessage: 'Send tip',
          })}
        >
          <Icon iconType="MaterialCommunityIcons" name="gift-outline" style={styles.railIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default React.memo(WavesReelItem);
