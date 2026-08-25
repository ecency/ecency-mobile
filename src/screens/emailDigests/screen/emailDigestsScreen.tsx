import React, { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SheetManager } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { DigestSubscription, DigestType } from '@ecency/sdk';

import { BasicHeader } from '../../../components';
import { SheetNames } from '../../../navigation/sheets';
import { useAppDispatch, useAuth } from '../../../hooks';
import { toastNotification } from '../../../redux/actions/uiAction';
import { findDigestSubscription, useDigestSubscriptionsQuery } from '../../../providers/queries';
import { useUnsubscribeAllDigestsMutation } from '../../../providers/sdk';

/**
 * Every email digest subscription of the signed-in account, across all its
 * addresses: change cadence or leave one (via the digest sheet), stop all mail
 * to one address, and join the own-notifications digest or the Ecency
 * newsletter. Reader phase of vision-mobile#3518.
 */
const EmailDigestsScreen = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username } = useAuth();

  const subscriptionsQuery = useDigestSubscriptionsQuery();
  const unsubscribeAllMutation = useUnsubscribeAllDigestsMutation();

  const subscriptions = subscriptionsQuery.data ?? [];

  const byAddress = useMemo(() => {
    const groups = new Map<string, DigestSubscription[]>();
    subscriptions.forEach((s) => {
      const rows = groups.get(s.email) ?? [];
      rows.push(s);
      groups.set(s.email, rows);
    });
    return [...groups.entries()];
  }, [subscriptions]);

  const _rowLabel = (s: DigestSubscription) => {
    switch (s.type) {
      case 'own':
        return intl.formatMessage({ id: 'newsletter.list_own' });
      case 'site':
        return intl.formatMessage({ id: 'newsletter.list_site' });
      case 'creator':
        return `@${s.target}`;
      default:
        return s.target;
    }
  };

  const _openSheet = (type: DigestType, target: string) => {
    SheetManager.show(SheetNames.NEWSLETTER_DIGEST, { payload: { type, target } });
  };

  const _handleStopAll = (email: string) => {
    Alert.alert(
      intl.formatMessage({ id: 'newsletter.stop_all_title' }),
      intl.formatMessage({ id: 'newsletter.stop_all_body' }, { email }),
      [
        { text: intl.formatMessage({ id: 'newsletter.cancel' }), style: 'cancel' },
        {
          text: intl.formatMessage({ id: 'newsletter.stop_all_ok' }),
          style: 'destructive',
          onPress: async () => {
            try {
              await unsubscribeAllMutation.mutateAsync(email);
              dispatch(toastNotification(intl.formatMessage({ id: 'newsletter.stop_all_done' })));
            } catch (err) {
              Alert.alert(intl.formatMessage({ id: 'newsletter.fail' }));
            }
          },
        },
      ],
    );
  };

  const _renderSubscriptionRow = (s: DigestSubscription) => (
    <TouchableOpacity key={s.id} style={styles.row} onPress={() => _openSheet(s.type, s.target)}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{_rowLabel(s)}</Text>
        <Text style={styles.rowMeta}>
          {`${intl.formatMessage({ id: `newsletter.cadence_${s.cadence}` })} • ${intl.formatMessage(
            {
              id: `newsletter.status_short_${s.status}`,
              defaultMessage: s.status,
            },
          )}`}
        </Text>
      </View>
      <Text style={styles.rowAction}>{intl.formatMessage({ id: 'newsletter.manage' })}</Text>
    </TouchableOpacity>
  );

  const _renderAddRow = (labelId: string, type: DigestType, target: string) => (
    <TouchableOpacity style={styles.row} onPress={() => _openSheet(type, target)}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{intl.formatMessage({ id: labelId })}</Text>
      </View>
      <Text style={styles.rowAction}>{intl.formatMessage({ id: 'newsletter.subscribe' })}</Text>
    </TouchableOpacity>
  );

  const _renderContent = () => {
    if (subscriptionsQuery.isLoading) {
      return <ActivityIndicator style={styles.loader} color={EStyleSheet.value('$primaryBlue')} />;
    }
    if (subscriptionsQuery.isError) {
      const status = (subscriptionsQuery.error as { status?: number })?.status;
      return (
        <Text style={styles.emptyText}>
          {intl.formatMessage({
            id: status === 503 ? 'newsletter.unavailable' : 'newsletter.fail',
          })}
        </Text>
      );
    }

    const hasOwn = !!username && !!findDigestSubscription(subscriptions, 'own', username);
    const hasSite = !!findDigestSubscription(subscriptions, 'site', 'ecency');

    return (
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {subscriptions.length === 0 && (
          <Text style={styles.emptyText}>{intl.formatMessage({ id: 'newsletter.empty' })}</Text>
        )}

        {byAddress.map(([email, rows]) => (
          <View key={email} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressText} numberOfLines={1}>
                {email}
              </Text>
              <TouchableOpacity onPress={() => _handleStopAll(email)}>
                <Text style={styles.stopAllText}>
                  {intl.formatMessage({ id: 'newsletter.stop_all' })}
                </Text>
              </TouchableOpacity>
            </View>
            {rows.map(_renderSubscriptionRow)}
          </View>
        ))}

        {(!hasOwn || !hasSite) && (
          <View style={styles.addressCard}>
            <Text style={styles.sectionTitle}>
              {intl.formatMessage({ id: 'newsletter.discover' })}
            </Text>
            {!hasOwn && !!username && _renderAddRow('newsletter.list_own', 'own', username)}
            {!hasSite && _renderAddRow('newsletter.list_site', 'site', 'ecency')}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <BasicHeader title={intl.formatMessage({ id: 'newsletter.screen_title' })} />
      {_renderContent()}
    </SafeAreaView>
  );
};

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContent: {
    padding: 16,
  },
  loader: {
    marginTop: 32,
  },
  emptyText: {
    fontSize: 15,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  addressCard: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '$primaryLightGray',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
    marginRight: 12,
  },
  stopAllText: {
    fontSize: 13,
    color: '$primaryRed',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 15,
    color: '$primaryBlack',
  },
  rowMeta: {
    fontSize: 13,
    color: '$primaryDarkGray',
    marginTop: 2,
  },
  rowAction: {
    fontSize: 14,
    color: '$primaryBlue',
  },
});

export default EmailDigestsScreen;
