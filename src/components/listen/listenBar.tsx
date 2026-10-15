import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getListenStatusQueryOptions,
  makeIdempotencyKey,
  useListenUnlock,
  type ListenStatus,
} from '@ecency/sdk';
import { Icon } from '../icon';
import { useAuth, useAppSelector, useRefreshAccessToken } from '../../hooks';
import { selectLanguage } from '../../redux/selectors';
import showLoginAlert from '../../utils/showLoginAlert';
import RootNavigation from '../../navigation/rootNavigation';
import ROUTES from '../../constants/routeNames';
import { countWords, extractPlainTextForTTS } from '../../utils/textToSpeech';
import { languageDisplayName } from '../../utils/iso639';
import { isUnreadableScript, listenMinutes, preparingMinutes } from '../../utils/listen';
import { ListenAudio } from './listenAudio';

interface ListenBarProps {
  post: any;
}

/**
 * Natural-voice audio of a post, above its body. A reader unlocks it once with Points;
 * the audio is made server-side and cached, so later readers of the same post get it at
 * once. Hidden for comments and for posts in a language without a voice. Mirrors the
 * web player (vision-web apps/web/src/features/listen).
 */
export const ListenBar = ({ post }: ListenBarProps) => {
  const intl = useIntl();
  const { username, code } = useAuth();
  const refreshAccessToken = useRefreshAccessToken();
  const queryClient = useQueryClient();
  const appLang = useAppSelector(selectLanguage) || 'en-US';
  const isComment = !!post?.parent_author;

  const words = useMemo(() => countWords(extractPlainTextForTTS(post)), [post?.body]);
  const unreadable = useMemo(() => isUnreadableScript(post?.body ?? ''), [post?.body]);

  const reader = username && code ? username : undefined;
  const {
    data: status,
    refetch,
    error: statusError,
  } = useQuery({
    ...getListenStatusQueryOptions(post?.author, post?.permlink, reader, code, post?.updated),
    enabled: !isComment && !!post?.author && !!post?.permlink,
  });

  // A screen open long enough for the access token to expire gets a 401 for the reader's
  // status: renew the token once and ask again with it (the answer lands in the same
  // cache entry, so the bar updates).
  const statusRenewedRef = useRef(false);
  useEffect(() => {
    if (!reader || !statusError || statusRenewedRef.current) return;
    if (!/\b401\b/.test(statusError.message)) return;
    statusRenewedRef.current = true;
    refreshAccessToken()
      .then((fresh) =>
        fresh && fresh !== code
          ? queryClient.fetchQuery({
              ...getListenStatusQueryOptions(
                post.author,
                post.permlink,
                reader,
                fresh,
                post.updated,
              ),
              staleTime: 0,
            })
          : undefined,
      )
      .catch(() => undefined);
  }, [statusError, reader, code, post, refreshAccessToken, queryClient]);

  const unlock = useListenUnlock(username, code);
  const keyRef = useRef<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const view: ListenStatus = status ?? { cost: 0, unlocked: false, status: 'none', languages: [] };
  const languages = view.languages.map((l) => languageDisplayName(l.lang)).join(' + ');
  const minutes = listenMinutes(view.languages, words);

  const _unlockFailed = useCallback(() => {
    Alert.alert(
      intl.formatMessage({ id: 'alert.fail' }),
      intl.formatMessage({ id: 'listen.unlock_failed' }),
    );
  }, [intl]);

  // token: a renewed access token, when the first attempt's was refused.
  const _send = useCallback(
    (token?: string) => {
      setBusy(true);
      // Reused until the outcome is known, so a retry after a lost answer is a replay.
      keyRef.current = keyRef.current ?? makeIdempotencyKey();
      unlock.mutate(
        {
          author: post.author,
          permlink: post.permlink,
          updated: post.updated,
          idempotency_key: keyRef.current,
          ...(token ? { code: token } : {}),
        },
        {
          onSuccess: () => {
            keyRef.current = undefined;
            setBusy(false);
          },
          onError: (err) => {
            const { status: httpStatus, data } = err as Error & {
              status?: number;
              data?: { required?: number; available?: number };
            };
            if (httpStatus === 401 && !token) {
              // The token expired while the screen was open: nothing was charged (the
              // request never got past the proxy). Renew it and send the same request.
              refreshAccessToken()
                .then((fresh) => {
                  if (fresh && fresh !== code) {
                    _send(fresh);
                    return;
                  }
                  keyRef.current = undefined;
                  setBusy(false);
                  _unlockFailed();
                })
                .catch(() => {
                  keyRef.current = undefined;
                  setBusy(false);
                  _unlockFailed();
                });
              return;
            }
            setBusy(false);
            // A definite answer: the next attempt is a new request.
            if (httpStatus && httpStatus >= 400 && httpStatus < 500) keyRef.current = undefined;
            if (httpStatus === 402) {
              Alert.alert(
                intl.formatMessage({ id: 'listen.not_enough_title' }),
                intl.formatMessage(
                  { id: 'listen.not_enough' },
                  { required: data?.required ?? view.cost, available: data?.available ?? 0 },
                ),
                [
                  { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'cancel' },
                  {
                    text: intl.formatMessage({ id: 'listen.get_points' }),
                    onPress: () =>
                      RootNavigation.navigate({ name: ROUTES.SCREENS.BOOST, params: { username } }),
                  },
                ],
              );
            } else {
              _unlockFailed();
            }
          },
        },
      );
    },
    [unlock, post, intl, view.cost, username, code, refreshAccessToken, _unlockFailed],
  );

  const _unlock = useCallback(() => {
    if (!username || busy || unlock.isPending) return;
    _send();
  }, [username, busy, unlock.isPending, _send]);

  const _confirm = () => {
    // Points are spent: never on a single tap.
    Alert.alert(
      intl.formatMessage({ id: 'listen.title' }),
      intl.formatMessage({ id: 'listen.confirm' }, { n: view.cost }),
      [
        { text: intl.formatMessage({ id: 'alert.cancel' }), style: 'cancel' },
        { text: intl.formatMessage({ id: 'alert.confirm' }), onPress: _unlock },
      ],
    );
  };

  // The text-only guess holds until the server has analysed the post.
  const analysedSupported =
    !!status && status.status !== 'unsupported' && status.languages.length > 0;
  // No minimum length: the service has none, and a short post unlocked on the web must
  // still play here.
  if (isComment || !post?.body || status?.status === 'unsupported') return null;
  if (unreadable && !analysedSupported) return null;

  const tracks = view.unlocked && view.status === 'ready' ? status?.tracks ?? [] : [];
  if (tracks.length > 0) {
    return (
      <ListenAudio
        post={post}
        tracks={tracks}
        uiLanguage={appLang}
        onExpired={async () => {
          // refetch() reports a failure in its result rather than throwing.
          const result = await refetch();
          if (!result.isError && result.data?.tracks?.length) return;
          // The screen may have outlived the access token as well as the URL: renew the
          // token and ask once more with it, so "Try again" can recover.
          const fresh = username ? await refreshAccessToken() : undefined;
          if (!fresh || fresh === code) {
            throw result.error ?? new Error('listen: no fresh audio URLs');
          }
          const renewed = await queryClient.fetchQuery({
            ...getListenStatusQueryOptions(
              post.author,
              post.permlink,
              username,
              fresh,
              post.updated,
            ),
            staleTime: 0,
          });
          if (!renewed?.tracks?.length) throw new Error('listen: no fresh audio URLs');
        }}
      />
    );
  }

  const preparing = view.unlocked && (view.status === 'preparing' || view.status === 'analyzing');

  return (
    <View style={styles.bar}>
      <Icon
        iconType="MaterialCommunityIcons"
        name="headphones"
        size={22}
        color={EStyleSheet.value('$primaryBlue')}
      />
      <View style={styles.titleBox}>
        <Text style={styles.title}>{intl.formatMessage({ id: 'listen.title' })}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {languages ? `${languages} · ` : ''}
          {intl.formatMessage({ id: 'listen.minutes' }, { n: minutes })}
          {view.status === 'failed' && !view.unlocked
            ? ` · ${intl.formatMessage({ id: 'listen.failed_refunded' })}`
            : ''}
        </Text>
      </View>

      {preparing && <PreparingState status={view} />}

      {!preparing && !username && (
        <TouchableOpacity style={styles.button} onPress={() => showLoginAlert({ intl })}>
          <Text style={styles.buttonText}>{intl.formatMessage({ id: 'listen.login' })}</Text>
        </TouchableOpacity>
      )}

      {!preparing && !!username && !status && <ActivityIndicator size="small" />}

      {!preparing && !!username && !!status && !view.unlocked && (
        <TouchableOpacity
          style={styles.button}
          onPress={_confirm}
          disabled={busy || unlock.isPending}
          accessibilityRole="button"
        >
          {busy || unlock.isPending ? (
            <ActivityIndicator size="small" color={EStyleSheet.value('$white')} />
          ) : (
            <Text style={styles.buttonText}>
              {intl.formatMessage({ id: 'listen.unlock' }, { n: view.cost })}
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Where the audio is. The server keeps the progress, so leaving and coming back shows
 * the same percentage rather than a restart: waiting in line (queued_ahead, 0 = next),
 * then a percentage once the worker reports one, and before either an estimate.
 */
export const PreparingState = ({ status }: { status: ListenStatus }) => {
  const intl = useIntl();
  const queued = typeof status.queued_ahead === 'number';
  const ahead = status.queued_ahead ?? 0;
  const progress = status.progress ?? 0;

  // The server only reports progress once the worker holds the job, never while queued.
  if (progress > 0) {
    const percent = Math.min(99, Math.round(progress * 100));
    return (
      <View
        style={styles.progressBox}
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: percent }}
      >
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${percent}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {intl.formatMessage({ id: 'listen.preparing_progress' }, { n: percent })}
        </Text>
      </View>
    );
  }

  let text: string;
  if (queued) {
    text =
      ahead > 0
        ? intl.formatMessage({ id: 'listen.waiting' }, { n: ahead })
        : intl.formatMessage({ id: 'listen.next_in_line' });
  } else if (status.languages.length) {
    text = intl.formatMessage(
      { id: 'listen.preparing_eta' },
      { n: preparingMinutes(status.languages) },
    );
  } else {
    text = intl.formatMessage({ id: 'listen.preparing' });
  }
  return (
    <View style={styles.preparing}>
      <ActivityIndicator size="small" />
      <Text style={styles.progressText}>{text}</Text>
    </View>
  );
};

const styles = EStyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 12,
    backgroundColor: '$primaryBackgroundColor',
  },
  titleBox: {
    flex: 1,
    minWidth: 120,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
  },
  subtitle: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginTop: 2,
  },
  button: {
    backgroundColor: '$primaryBlue',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
    minWidth: 72,
    alignItems: 'center',
  },
  buttonText: {
    color: '$white',
    fontSize: 13,
    fontWeight: '600',
  },
  preparing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBox: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressTrack: {
    width: 96,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '$primaryLightBackground',
  },
  progressFill: {
    height: 6,
    backgroundColor: '$primaryBlue',
  },
  progressText: {
    fontSize: 12,
    color: '$primaryDarkGray',
  },
});
