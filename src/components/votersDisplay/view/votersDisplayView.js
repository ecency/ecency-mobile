import React from 'react';
import { SafeAreaView, FlatList } from 'react-native';

// Utils
import { useNavigation } from '@react-navigation/native';
import { getTimeFromNow } from '../../../utils/time';

// Components
import { EmptyScreen, UserListItem } from '../../basicUIElements';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './votersDisplayStyles';

const VotersDisplayView = ({ votes, createdAt = '2010-01-01T00:00:00' }) => {
  const navigation = useNavigation();

  const _handleOnUserPress = (username) => {
    navigation.navigate({
      name: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  const _renderItem = ({ item, index }) => {
    const value = item.reward && `$ ${item.reward}`;
    const percent = !Number.isNaN(item.percent100) && `${item.percent100}%`;

    // snippet to avoid rendering time form long past
    const minTimestamp = new Date(createdAt).getTime();
    const voteTimestamp = new Date(item.time).getTime();
    const timeString = item.time && minTimestamp < voteTimestamp ? getTimeFromNow(item.time) : null;

    return (
      <UserListItem
        index={index}
        username={item.voter}
        description={timeString}
        isHasRightItem
        isRightColor={item.is_down_vote}
        rightText={value}
        isLoggedIn
        handleOnPress={() => _handleOnUserPress(item.voter)}
        isClickable
        subRightText={percent}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {votes && votes.length > 0 ? (
        <FlatList
          data={votes}
          keyExtractor={(item) => item.voter}
          removeClippedSubviews={false}
          renderItem={_renderItem}
        />
      ) : (
        <EmptyScreen style={styles.emptyContainer} />
      )}
    </SafeAreaView>
  );
};

export default VotersDisplayView;
