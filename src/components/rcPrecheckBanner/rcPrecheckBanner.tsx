import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import type { RcPrecheckPayload } from '@ecency/sdk';

import { setRcOffer } from '../../redux/actions/uiAction';
import { useAppDispatch } from '../../hooks';
import { useRcPrecheck } from '../../hooks/useRcPrecheck';
import { generateUniquePermlink } from '../../utils/editor';
import { buildEditorRcPayload } from '../../utils/rcPayload';
import styles from './rcPrecheckBannerStyles';

interface Props {
  /** The account that will sign, or undefined when logged out. */
  username?: string;
  /** The editor's live draft: title, body, tags, aiTools. */
  fields: any;
  /** The parent post, when this editor is composing a reply. */
  post?: any;
  isReply?: boolean;
}

/**
 * Costing the draft is not free: it parses the body for images and links, so it
 * runs on a pause in typing rather than on every keystroke.
 */
const BUILD_DEBOUNCE_MS = 800;

/**
 * Warns, while the draft is still being written, that the account cannot afford
 * to broadcast it.
 *
 * Before this the first anyone heard of a shortfall was the chain rejecting a
 * post they had already finished, and for a large enough post waiting does not
 * help either: the cost can exceed the account's maximum RC rather than just
 * its current balance.
 *
 * Non-blocking by design. The estimate carries a safety buffer and the pool
 * moves between the estimate and the broadcast, so this advises and never
 * prevents. Tapping it opens the same offer sheet a failed broadcast raises, so
 * there is one place that sells a top-up or a boost.
 */
const RcPrecheckBanner = ({ username, fields, post, isReply }: Props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [payload, setPayload] = useState<RcPrecheckPayload | undefined>();

  const body = fields?.body ?? '';
  const title = fields?.title ?? '';
  const tags = fields?.tags;

  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(() => {
      buildEditorRcPayload({
        username: username!,
        fields,
        post,
        isReply,
        // Time-derived at broadcast, so only its length feeds the estimate.
        replyPermlink: isReply
          ? generateUniquePermlink(`re-${String(post?.author ?? '').replace(/\./g, '')}`)
          : undefined,
      })
        .then((next) => {
          if (!cancelled) {
            setPayload(next);
          }
        })
        .catch(() => {
          // An estimate is a courtesy. If the draft cannot be costed, say
          // nothing rather than guessing or interrupting the writer.
          if (!cancelled) {
            setPayload(undefined);
          }
        });
    }, BUILD_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, title, body, JSON.stringify(tags), post?.author, post?.permlink, isReply]);

  useEffect(() => {
    if (!username) {
      setPayload(undefined);
    }
  }, [username]);

  const { ready, willLikelyFail } = useRcPrecheck(username, payload);

  if (!username || !ready || !willLikelyFail) {
    return null;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => dispatch(setRcOffer(true))}
      style={styles.container}
    >
      <View style={styles.textContainer}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'alert.rc_precheck_title' })}</Text>
        <Text style={styles.body}>{intl.formatMessage({ id: 'alert.rc_precheck_body' })}</Text>
      </View>
      <Text style={styles.action}>{intl.formatMessage({ id: 'alert.rc_down_topup' })}</Text>
    </TouchableOpacity>
  );
};

export default RcPrecheckBanner;
