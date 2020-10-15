import React from 'react';
import { SafeAreaView, FlatList, Text } from 'react-native';
import { withNavigation } from 'react-navigation';
import { useIntl } from 'react-intl';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { UserListItem } from '../../basicUIElements';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './votersDisplayStyles';

const VotersDisplayView = ({ votes, navigation }) => {
  const intl = useIntl();

  /*getActiveVotes(get(content, 'author'), get(content, 'permlink'))
        .then((result) => {
          result.sort((a, b) => b.rshares - a.rshares);

          const _votes = parseActiveVotes({ ...content, active_votes: result });
          setActiveVotes(_votes);
        })
        .catch(() => {});*/

  const _handleOnUserPress = (username) => {
    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  const _renderItem = ({ item, index }) => {
    const value = `$ ${item.value}`;
    const percent = `${item.percent}%`;

    return (
      <UserListItem
        index={index}
        username={item.voter}
        description={getTimeFromNow(item.time)}
        isHasRightItem
        isRightColor={item.is_down_vote}
        rightText={value}
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
        <Text style={styles.text}>
          {intl.formatMessage({
            id: 'voters.no_user',
          })}
        </Text>
      )}
    </SafeAreaView>
  );
};

export default withNavigation(VotersDisplayView);
