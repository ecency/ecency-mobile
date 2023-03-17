import React, { useEffect, useState } from 'react';

// Constants
import FILTER_OPTIONS from '../../../constants/options/leaderboard';

// Component
import LeaderboardView from '../view/leaderboardView';
import { showProfileModal, toastNotification } from '../../../redux/actions/uiAction';
import { useDispatch } from 'react-redux';
import { leaderboardQuries } from '../../../providers/queries';
import { useQueryClient } from '@tanstack/react-query';
import QUERIES from '../../../providers/queries/queryKeys';
import { useIntl } from 'react-intl';

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

  const leaderboardQuery = leaderboardQuries.useGetLeaderboardQuery(duration)

  //update failure handler
  useEffect(() => {
    if (!leaderboardQuery.isFetching && leaderboardQuery.error) {
      dispatch(toastNotification(intl.formatMessage(
        { id: 'alert.something_wrong_msg' },
        { message: leaderboardQuery.error.message }
      )));
    }
  }, [leaderboardQuery.error])


  const _handleOnUserPress = (username) => {
    dispatch(showProfileModal(username));
  };



  const _fetchLeaderBoard = async (selectedFilter, index) => {

    //condition for detecting refresh
    if (index === undefined || !selectedFilter) {
      index = selectedIndex;
      selectedFilter = FILTER_OPTIONS[index];
      queryClient.invalidateQueries([QUERIES.LEADERBOARD.GET, selectedFilter]);
    }

    //tab change state update
    setSelectedIndex(index);
    setDuration(selectedFilter);

  };


  return (
    <LeaderboardView
      users={leaderboardQuery.data}
      refreshing={leaderboardQuery.isFetching || leaderboardQuery.isLoading}
      fetchLeaderBoard={_fetchLeaderBoard}
      handleOnUserPress={_handleOnUserPress}
      selectedIndex={selectedIndex}
    />
  )
}


export default LeaderboardContainer;
