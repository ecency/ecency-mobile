import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useIntl } from 'react-intl';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';
import { BAN_NOTICE_TICK_MS, ChatBanInfo, formatChatBanNotice } from '../utils/chatBanNotice';

interface ChatBanBannerProps {
  info: ChatBanInfo;
  /** Called once the ban lapses, so the caller can clear the banner without a reload. */
  onExpire?: () => void;
}

/**
 * Standing notice shown while the user is banned from posting.
 *
 * Replaces a one-shot toast. A ban is a state, not an event: a toast explains it once and then
 * every later send just fails silently, which is how the original version left people with no
 * idea why nothing sent.
 */
export const ChatBanBanner: React.FC<ChatBanBannerProps> = ({ info, onExpire }) => {
  const intl = useIntl();
  const [now, setNow] = useState(() => Date.now());

  // Held in a ref so an inline arrow from the caller doesn't restart the interval each render.
  // Assigned in an effect rather than during render: a render React discards could otherwise
  // mutate the ref the already-committed interval reads from.
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= info.bannedUntil) {
        clearInterval(id);
        onExpireRef.current?.();
      }
    }, BAN_NOTICE_TICK_MS);
    return () => clearInterval(id);
  }, [info.bannedUntil]);

  return (
    <View style={styles.dmWarningContainer}>
      {/* eslint-disable-next-line jsx-a11y/accessible-emoji */}
      <Text style={styles.dmWarningIcon}>⏳</Text>
      <View style={styles.dmWarningContent}>
        <Text style={styles.dmWarningBody}>
          {formatChatBanNotice(info, now, intl.formatMessage)}
        </Text>
      </View>
    </View>
  );
};
