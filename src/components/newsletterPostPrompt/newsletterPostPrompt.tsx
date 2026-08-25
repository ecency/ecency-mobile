import React, { useEffect, useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { SheetNames } from '../../navigation/sheets';
import { useAuth } from '../../hooks';
import { useDigestSubscription } from '../../providers/queries';
import { getItemFromStorage, setItemToStorage } from '../../storage/storage';
import { IconButton } from '../iconButton';
import { pickPostDigestTarget, postPromptStorageKey } from './postDigestTarget';

interface Props {
  post:
    | { author?: string; category?: string; parent_author?: string; depth?: number }
    | null
    | undefined;
}

/**
 * End-of-post subscribe card (web parity, vision-mobile#3520): offers the
 * digest that would carry this post. Never shown while a subscription for
 * that list exists; an explicit dismissal is remembered per viewer AND list.
 */
const NewsletterPostPrompt = ({ post }: Props) => {
  const intl = useIntl();
  const { username } = useAuth();

  const target = useMemo(() => pickPostDigestTarget(post, username), [post, username]);

  // null = storage answer pending; the card must not flash in before it.
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  const storageKey =
    target && username ? postPromptStorageKey(username, target.type, target.target) : null;

  useEffect(() => {
    let live = true;
    setDismissed(null);
    if (!storageKey) {
      return undefined;
    }
    getItemFromStorage(storageKey)
      .then((flag) => {
        if (live) {
          setDismissed(!!flag);
        }
      })
      // A failing store also cannot have PERSISTED a dismissal, so offering
      // is the consistent outcome; leaving null would hide the card forever.
      .catch(() => {
        if (live) {
          setDismissed(false);
        }
      });
    return () => {
      live = false;
    };
  }, [storageKey]);

  const subscriptionQuery = useDigestSubscription(target?.type ?? 'creator', target?.target ?? '');

  // Render only once BOTH answers are in: the storage flag AND a successful
  // subscriptions lookup. Unresolved data is "don't know", not "not
  // subscribed" — rendering early would flash the card at existing
  // subscribers, and on a failed lookup it would offer a sheet that can only
  // report the service as unavailable.
  if (
    !target ||
    dismissed !== false ||
    !subscriptionQuery.isSuccess ||
    subscriptionQuery.subscription
  ) {
    return null;
  }

  const listLabel = target.type === 'creator' ? `@${target.target}` : target.target;

  const _handleDismiss = () => {
    setDismissed(true);
    if (storageKey) {
      // The in-session state above already hides the card; a lost write only
      // costs persistence, never an unhandled rejection.
      setItemToStorage(storageKey, { dismissedAt: new Date().toISOString() }).catch(() => {});
    }
  };

  const _handleSubscribe = () => {
    SheetManager.show(SheetNames.NEWSLETTER_DIGEST, {
      payload: { type: target.type, target: target.target },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.textWrapper}>
        <Text style={styles.text}>
          {intl.formatMessage({ id: `newsletter.body_${target.type}` }, { list: listLabel })}
        </Text>
      </View>
      <TouchableOpacity style={styles.subscribeButton} onPress={_handleSubscribe}>
        <Text style={styles.subscribeText}>
          {intl.formatMessage({ id: 'newsletter.subscribe' })}
        </Text>
      </TouchableOpacity>
      <IconButton
        iconType="MaterialIcons"
        name="close"
        size={18}
        color={EStyleSheet.value('$primaryDarkGray')}
        onPress={_handleDismiss}
      />
    </View>
  );
};

const styles = EStyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 4,
    marginTop: 12,
    marginHorizontal: 0,
  },
  textWrapper: {
    flex: 1,
    marginRight: 8,
  },
  text: {
    fontSize: 13,
    color: '$primaryDarkGray',
    lineHeight: 18,
  },
  subscribeButton: {
    backgroundColor: '$primaryBlue',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  subscribeText: {
    fontSize: 13,
    color: '$white',
    fontWeight: '600',
  },
});

export default NewsletterPostPrompt;
