import React, { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getWavesFeedQueryOptions } from '@ecency/sdk';
import { Comments, NoPost } from '../..';
import { useAppSelector } from '../../../hooks';
import { selectHidePostsThumbnails } from '../../../redux/selectors';
import { wavesQueries } from '../../../providers/queries';
import { PostTypes } from '../../../constants/postTypes';
import styles from '../profileStyles';

interface WavesTabContentProps {
  username: string;
  isOwnProfile: boolean;
  onScroll?: (event: any) => void;
}

const WavesTabContent = ({ username, isOwnProfile, onScroll }: WavesTabContentProps) => {
  const intl = useIntl();
  const isHideImage = useAppSelector(selectHidePostsThumbnails);

  // The per-author feed is the same combined endpoint scoped to one author
  // (across every container). No observer is passed: you're deliberately
  // viewing this profile, so a mute of theirs shouldn't blank their waves.
  const queryOptions = useMemo(() => getWavesFeedQueryOptions({ author: username }), [username]);
  // injectPromoted=false (no promoted cards on a profile), applyMuteFilter=false
  // so a muted author's own profile tab still shows their waves.
  const wavesQuery = wavesQueries.useWavesQuery(queryOptions, false, false);

  const _renderListEmpty = () => {
    if (wavesQuery.isLoading) {
      return (
        <View style={styles.commentsListFooter}>
          <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} size="large" />
        </View>
      );
    }
    return (
      <NoPost
        name={username}
        text={intl.formatMessage({ id: 'profile.havent_posted' })}
        defaultText={intl.formatMessage({ id: 'profile.login_to_see' })}
      />
    );
  };

  const _renderListFooter = () => (
    <View style={styles.commentsListFooter}>
      {wavesQuery.isFetchingNextPage && (
        <ActivityIndicator color={EStyleSheet.value('$primaryBlue')} size="large" />
      )}
    </View>
  );

  return (
    <View key="profile.waves" style={styles.commentsTabBar}>
      <Comments
        postType={PostTypes.WAVE}
        comments={wavesQuery.data}
        handleCommentDelete={wavesQuery.deleteWave}
        isOwnProfile={isOwnProfile}
        isHideImage={isHideImage}
        flatListProps={{
          onEndReached: () => {
            if (wavesQuery.hasNextPage && !wavesQuery.isFetchingNextPage) {
              wavesQuery.fetchNextPage();
            }
          },
          onScrollEndDrag: onScroll,
          ListEmptyComponent: _renderListEmpty,
          ListFooterComponent: _renderListFooter,
          onEndReachedThreshold: 1,
          refreshControl: (
            <RefreshControl
              refreshing={wavesQuery.isRefreshing}
              onRefresh={() => wavesQuery.refresh()}
            />
          ),
        }}
      />
    </View>
  );
};

export default WavesTabContent;
