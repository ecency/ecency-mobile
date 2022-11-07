import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { ActivityIndicator, RefreshControl, View } from 'react-native';
import { unionBy } from 'lodash';
import { Comments, NoPost } from '../..';
import { useAppSelector } from '../../../hooks';
import { getAccountPosts } from '../../../providers/hive/dhive';
import styles from '../profileStyles';

interface CommentsTabContentProps {
  username: string;
  type: 'comments' | 'replies';
  isOwnProfile: boolean;
  selectedUser: any;
  onScroll: () => void;
}

const CommentsTabContent = ({
  isOwnProfile,
  username,
  type,
  onScroll,
  selectedUser,
}: CommentsTabContentProps) => {
  const intl = useIntl();

  const isHideImage = useAppSelector((state) => state.application.hidePostsThumbnails);

  const [data, setData] = useState([]);
  const [lastAuthor, setLastAuthor] = useState('');
  const [lastPermlink, setLastPermlink] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noMore, setNoMore] = useState(false);

  useEffect(() => {
    if (selectedUser) {
      _fetchData();
    }
  }, [selectedUser]);

  const _fetchData = async ({ refresh }: { refresh?: boolean } = {}) => {
    if (loading || (!refresh && noMore)) {
      return;
    }

    setLoading(true);
    if (refresh) {
      setRefreshing(true);
    }

    const query: any = {
      account: username,
      start_author: refresh ? '' : lastAuthor,
      start_permlink: refresh ? '' : lastPermlink,
      limit: 10,
      observer: '',
      sort: type,
    };

    const result = await getAccountPosts(query);
    const _comments: any[] = refresh ? result : unionBy(data, result, 'permlink');

    if (Array.isArray(_comments)) {
      setData(_comments);
      if (_comments.length > 0) {
        setLastAuthor(_comments[_comments.lastIndex].author);
        setLastPermlink(_comments[_comments.lastIndex].permlink);
      }
      if (result.length == 0) {
        setNoMore(true);
      }
    } else {
      setData([]);
      setNoMore(true);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const _renderListEmpty = () => {
    if (loading) {
      return null;
    }
    return (
      <NoPost
        name={username}
        text={intl.formatMessage({
          id: 'profile.havent_commented',
        })}
        defaultText={intl.formatMessage({
          id: 'profile.login_to_see',
        })}
      />
    );
  };

  const _renderListFooter = () => {
    return (
      <View style={styles.commentsListFooter}>{loading && <ActivityIndicator size="large" />}</View>
    );
  };

  return (
    <View key="profile.comments" style={styles.commentsTabBar}>
      <Comments
        comments={data}
        fetchPost={() => {}}
        isOwnProfile={isOwnProfile}
        isHideImage={isHideImage}
        flatListProps={{
          onEndReached: _fetchData,
          onScroll,
          ListEmptyComponent: _renderListEmpty,
          ListFooterComponent: _renderListFooter,
          onEndReachedThreshold: 1,
          refreshControl: (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => _fetchData({ refresh: true })}
            />
          ),
        }}
      />
    </View>
  );
};

export default CommentsTabContent;
