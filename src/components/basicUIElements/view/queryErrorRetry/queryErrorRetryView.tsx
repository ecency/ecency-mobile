import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';

import { Icon } from '../../../icon';
import styles from './queryErrorRetryStyles';

interface Props {
  /** The query error, used only to pick between the two messages. */
  error?: unknown;
  onRetry: () => void;
  /** True while the retry is in flight, so the button reads as busy. */
  isRetrying?: boolean;
  /** Inline variant for a card or a list header rather than a full empty state. */
  compact?: boolean;
}

/**
 * Terminal state for a query that failed: says what happened and offers the one
 * action that can fix it. Every list or card that can show a loading skeleton
 * needs one of these, otherwise a request that never answers reads as a screen
 * that is still working.
 *
 * `TimeoutError` is set by the global fetch deadline (utils/networkTimeout) and
 * by the ecencyApi response interceptor, and it earns a different message: the
 * server said nothing at all, which points at the connection rather than at us.
 */
const QueryErrorRetry = ({ error, onRetry, isRetrying, compact }: Props) => {
  const intl = useIntl();

  const isTimeout = (error as { name?: string })?.name === 'TimeoutError';

  return (
    <View style={compact ? styles.containerCompact : styles.container}>
      <Icon
        iconType="MaterialIcons"
        name={isTimeout ? 'cloud-off' : 'error-outline'}
        size={compact ? 18 : 28}
        style={styles.icon}
      />
      <Text style={compact ? styles.messageCompact : styles.message}>
        {intl.formatMessage({
          id: isTimeout ? 'alert.request_timed_out' : 'alert.load_failed_retry',
        })}
      </Text>
      <TouchableOpacity
        style={[styles.button, isRetrying && styles.buttonDisabled]}
        onPress={() => onRetry()}
        disabled={isRetrying}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {intl.formatMessage({
            id: isRetrying ? 'alert.retrying' : 'alert.something_wrong_reload',
          })}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default QueryErrorRetry;
