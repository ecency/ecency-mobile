import React, { useEffect, useState } from 'react';

// Constants
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { SheetManager } from 'react-native-actions-sheet';
import FILTER_OPTIONS from '../../../constants/options/leaderboard';

// Component
import LeaderboardView from '../view/leaderboardView';
import { toastNotification } from '../../../redux/actions/uiAction';
import { leaderboardQuries } from '../../../providers/queries';
import { SheetNames } from '../../../navigation/sheets';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

const LeaderboardContainer = () => {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [duration, setDuration] = useState(FILTER_OPTIONS[selectedIndex]);

  const leaderboardQuery = leaderboardQuries.useGetLeaderboardQuery(duration);

  // surface fetch errors as a toast
  useEffect(() => {
    if (!leaderboardQuery.isFetching && leaderboardQuery.error) {
      dispatch(
        toastNotification(
          intl.formatMessage(
            { id: 'alert.something_wrong_msg' },
            { message: leaderboardQuery.error.message },
          ),
        ),
      );
    }
  }, [leaderboardQuery.error, leaderboardQuery.isFetching, dispatch, intl]);

  const _handleOnUserPress = (username) => {
    SheetManager.show(SheetNames.QUICK_PROFILE, {
      payload: {
        username,
      },
    });
  };

  const _fetchLeaderBoard = (selectedFilter, index) => {
    // pull-to-refresh: no args → refetch the active query directly so its
    // isFetching cycle drives the spinner. The previous code invalidated a
    // mismatched key so isFetching never flipped and the spinner stuck.
    if (index === undefined || !selectedFilter) {
      leaderboardQuery.refetch();
      return;
    }

    // tab change state update
    setSelectedIndex(index);
    setDuration(selectedFilter);
  };

  return (
    <LeaderboardView
      users={leaderboardQuery.data}
      refreshing={leaderboardQuery.isFetching}
      fetchLeaderBoard={_fetchLeaderBoard}
      handleOnUserPress={_handleOnUserPress}
      selectedIndex={selectedIndex}
    />
  );
};

export default LeaderboardContainer;
