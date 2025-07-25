import React, { useEffect, useState } from 'react';

// Constants
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import FILTER_OPTIONS from '../../../constants/options/leaderboard';

// Component
import LeaderboardView from '../view/leaderboardView';
import { toastNotification } from '../../../redux/actions/uiAction';
import { leaderboardQuries } from '../../../providers/queries';
import QUERIES from '../../../providers/queries/queryKeys';
import { SheetNames } from '../../../navigation/sheets';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const LeaderboardContainer = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [duration, setDuration] = useState(FILTER_OPTIONS[selectedIndex]);
  const [refreshing, setRefreshing] = useState(false);

  const leaderboardQuery = leaderboardQuries.useGetLeaderboardQuery(duration);

  // update failure handler
  useEffect(() => {
    if (!leaderboardQuery.isFetching) {
      setRefreshing(false);
      if (leaderboardQuery.error) {
        dispatch(
          toastNotification(
            intl.formatMessage(
              { id: 'alert.something_wrong_msg' },
              { message: leaderboardQuery.error.message },
            ),
          ),
        );
      }
    }
  }, [leaderboardQuery.error, leaderboardQuery.isFetching]);

  const _handleOnUserPress = (username) => {
    SheetManager.show(SheetNames.QUICK_PROFILE, {
      payload: {
        username,
      },
    });
  };

  const _fetchLeaderBoard = async (selectedFilter, index) => {
    // condition for detecting refresh
    if (index === undefined || !selectedFilter) {
      index = selectedIndex;
      selectedFilter = FILTER_OPTIONS[index];
      queryClient.invalidateQueries({ queryKey: [QUERIES.LEADERBOARD.GET, selectedFilter] });
      setRefreshing(true);
    }

    // tab change state update
    setSelectedIndex(index);
    setDuration(selectedFilter);
  };

  return (
    <LeaderboardView
      users={leaderboardQuery.data}
      refreshing={leaderboardQuery.isLoading || refreshing}
      fetchLeaderBoard={_fetchLeaderBoard}
      handleOnUserPress={_handleOnUserPress}
      selectedIndex={selectedIndex}
    />
  );
};

export default LeaderboardContainer;
