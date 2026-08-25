import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { DigestCadence } from '@ecency/sdk';
import { MainButton } from '../mainButton';
import { useAppDispatch } from '../../hooks';
import { toastNotification } from '../../redux/actions/uiAction';
import {
  MOBILE_DIGEST_SOURCE,
  findDigestSubscription,
  knownDigestAddress,
  useDigestSubscriptionsQuery,
  useLeaveDigestMutation,
  useSubscribeDigestMutation,
} from '../../providers/queries';

const FALLBACK_SHEET_ID = 'newsletter_digest';

/**
 * Result of the sheet. Both variants are objects because
 * react-native-actions-sheet 0.9.7 publishes `data || payloadRef.current` on
 * close, so a falsy return value is silently replaced by the original payload
 * object; callers must gate on a field, never on truthiness.
 */
export interface NewsletterDigestResult {
  done?: boolean;
  cancelled?: boolean;
}

const CADENCES: DigestCadence[] = ['weekly', 'monthly'];

// Enough to catch a typo before the relay does; the service still validates
// and double opt-in proves ownership either way.
const EMAIL_RE = /^\S+@\S+\.\S+$/;

/**
 * Subscribe to / manage ONE email digest list (own notifications, a creator,
 * a community, or the site newsletter). Signed-in only: the relay attributes
 * the subscription to the verified account and skips the captcha. A new
 * address gets double opt-in, surfaced here as the check-your-inbox state.
 */
const NewsletterDigestSheet: React.FC<SheetProps<'newsletter_digest'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const closedRef = useRef(false);

  const [email, setEmail] = useState('');
  const [cadence, setCadence] = useState<DigestCadence | null>(null);
  const [checkInboxEmail, setCheckInboxEmail] = useState('');

  const type = payload?.type ?? 'site';
  const target = payload?.target ?? 'ecency';

  const subscriptionsQuery = useDigestSubscriptionsQuery();
  const subscription = findDigestSubscription(subscriptionsQuery.data, type, target);
  const knownAddress = subscription?.email || knownDigestAddress(subscriptionsQuery.data);

  const subscribeMutation = useSubscribeDigestMutation();
  const leaveMutation = useLeaveDigestMutation();

  const _reset = useCallback(() => {
    closedRef.current = false;
    setEmail('');
    setCadence(null);
    setCheckInboxEmail('');
  }, []);

  // Registered sheets stay mounted; onBeforeShow is the authoritative reset
  // and the effect covers a payload swap while the sheet is already open.
  useEffect(() => {
    _reset();
  }, [payload, _reset]);

  const _close = (result: NewsletterDigestResult) => {
    if (closedRef.current) {
      return;
    }
    closedRef.current = true;
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: result });
  };

  const effectiveCadence: DigestCadence = cadence ?? subscription?.cadence ?? 'weekly';
  const needsEmailInput = !knownAddress;
  const emailValid = EMAIL_RE.test(email.trim());
  const isPending = subscribeMutation.isPending || leaveMutation.isPending;

  const _listLabel = () => {
    switch (type) {
      case 'own':
        return intl.formatMessage({ id: 'newsletter.list_own' });
      case 'site':
        return intl.formatMessage({ id: 'newsletter.list_site' });
      case 'community':
        return payload?.targetLabel || target;
      default:
        return `@${target}`;
    }
  };

  const _handleSubscribe = async () => {
    const address = knownAddress || email.trim();
    if (!address) {
      return;
    }
    try {
      const result = await subscribeMutation.mutateAsync({
        email: address,
        type,
        target,
        cadence: effectiveCadence,
        source: MOBILE_DIGEST_SOURCE,
      });
      if (result.status === 'refused') {
        Alert.alert(intl.formatMessage({ id: 'newsletter.refused' }));
        return;
      }
      if (result.status === 'pending_confirmation') {
        setCheckInboxEmail(address);
        return;
      }
      dispatch(toastNotification(intl.formatMessage({ id: 'newsletter.subscribed' })));
      _close({ done: true });
    } catch (err) {
      const status = (err as { status?: number })?.status;
      Alert.alert(
        intl.formatMessage({
          id: status === 429 ? 'newsletter.too_many' : 'newsletter.fail',
        }),
      );
    }
  };

  const _handleLeave = async () => {
    if (!subscription) {
      return;
    }
    try {
      await leaveMutation.mutateAsync(subscription.id);
      dispatch(toastNotification(intl.formatMessage({ id: 'newsletter.left' })));
      _close({ done: true });
    } catch (err) {
      Alert.alert(intl.formatMessage({ id: 'newsletter.fail' }));
    }
  };

  const _renderCheckInbox = () => (
    <View style={styles.container}>
      <Text style={styles.title}>{intl.formatMessage({ id: 'newsletter.check_inbox_title' })}</Text>
      <Text style={styles.description}>
        {intl.formatMessage({ id: 'newsletter.check_inbox_body' }, { email: checkInboxEmail })}
      </Text>
      <MainButton
        onPress={() => _close({ done: true })}
        text={intl.formatMessage({ id: 'newsletter.ok' })}
        style={styles.confirmButton}
      />
    </View>
  );

  const isPendingConfirmation = subscription?.status === 'pending_confirmation';
  const isActive = subscription?.status === 'active';
  const cadenceUnchanged = isActive && effectiveCadence === subscription?.cadence;

  const primaryLabelId = (() => {
    if (isPendingConfirmation && effectiveCadence === subscription?.cadence) {
      return 'newsletter.resend';
    }
    if (isActive || isPendingConfirmation) {
      return 'newsletter.update';
    }
    return 'newsletter.subscribe';
  })();

  const _renderForm = () => (
    <View style={styles.container}>
      <Text style={styles.title}>
        {payload?.firstPublish
          ? intl.formatMessage({ id: 'newsletter.first_publish_title' })
          : intl.formatMessage({ id: 'newsletter.title' }, { list: _listLabel() })}
      </Text>
      <Text style={styles.description}>
        {payload?.firstPublish
          ? intl.formatMessage({ id: 'newsletter.first_publish_body' })
          : intl.formatMessage({ id: `newsletter.body_${type}` }, { list: _listLabel() })}
      </Text>

      {isActive && (
        <Text style={styles.status}>{intl.formatMessage({ id: 'newsletter.status_active' })}</Text>
      )}
      {isPendingConfirmation && (
        <Text style={styles.status}>{intl.formatMessage({ id: 'newsletter.status_pending' })}</Text>
      )}

      <View style={styles.cadenceRow}>
        {CADENCES.map((option) => {
          const selected = effectiveCadence === option;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.cadenceButton, selected && styles.cadenceButtonSelected]}
              onPress={() => setCadence(option)}
              disabled={isPending}
            >
              <Text style={[styles.cadenceText, selected && styles.cadenceTextSelected]}>
                {intl.formatMessage({ id: `newsletter.cadence_${option}` })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {needsEmailInput && (
        <TextInput
          style={styles.input}
          placeholder={intl.formatMessage({ id: 'newsletter.email_placeholder' })}
          placeholderTextColor={EStyleSheet.value('$primaryDarkGray')}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="done"
        />
      )}

      <MainButton
        onPress={_handleSubscribe}
        isLoading={subscribeMutation.isPending}
        isDisable={isPending || (needsEmailInput && !emailValid) || cadenceUnchanged}
        text={intl.formatMessage({ id: primaryLabelId })}
        style={styles.confirmButton}
      />

      {!!subscription && (
        <MainButton
          onPress={_handleLeave}
          isLoading={leaveMutation.isPending}
          isDisable={isPending}
          text={intl.formatMessage({ id: 'newsletter.leave' })}
          style={styles.leaveButton}
          textStyle={styles.leaveButtonText}
        />
      )}

      <MainButton
        onPress={() => _close({ cancelled: true })}
        text={intl.formatMessage({ id: 'newsletter.cancel' })}
        style={styles.cancelButton}
        textStyle={styles.cancelButtonText}
      />
    </View>
  );

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      onBeforeShow={_reset}
      containerStyle={styles.sheetContainer}
    >
      {checkInboxEmail ? _renderCheckInbox() : _renderForm()}
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 0,
    backgroundColor: '$primaryBackgroundColor',
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  status: {
    fontSize: 13,
    color: '$primaryBlue',
    textAlign: 'center',
    marginBottom: 12,
  },
  cadenceRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cadenceButton: {
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  cadenceButtonSelected: {
    backgroundColor: '$primaryBlue',
    borderColor: '$primaryBlue',
  },
  cadenceText: {
    fontSize: 14,
    color: '$primaryBlack',
  },
  cadenceTextSelected: {
    color: '$white',
  },
  input: {
    borderWidth: 1,
    borderColor: '$primaryLightGray',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '$primaryBlack',
    backgroundColor: '$primaryLightBackground',
    marginBottom: 16,
  },
  confirmButton: {
    marginBottom: 0,
  },
  leaveButton: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  leaveButtonText: {
    color: '$primaryRed',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '$primaryDarkGray',
  },
});

export default NewsletterDigestSheet;
