import React, { useState } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services and Actions
import {
  moveScheduledToDraft,
} from '../../../providers/ecency/ecency';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import DraftsScreen from '../screen/draftsScreen';
import { useDraftDeleteMutation, useGetDraftsQuery, useGetSchedulesQuery, useScheduleDeleteMutation } from '../../../providers/queries/draftQueries';


const DraftsContainer = ({ currentAccount, intl, navigation, dispatch, route }) => {

  const { mutate: deleteDraft, isLoading: isDeletingDraft } = useDraftDeleteMutation()
  const { mutate: deleteSchedule, isLoading: isDeletingSchedule } = useScheduleDeleteMutation();

  const {
    isLoading: isLoadingDrafts,
    data: drafts = [],
    isFetching: isFetchingDrafts,
    refetch: refetchDrafts
  } = useGetDraftsQuery();

  const {
    isLoading: isLoadingSchedules,
    data: schedules = [],
    isFetching: isFetchingSchedules,
    refetch: refetchSchedules
  } = useGetSchedulesQuery();


  const [initialTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

  // Component Functions
  const _onRefresh = () => {
    refetchDrafts();
    refetchSchedules();
  }

  const _moveScheduleToDraft = (id) => {
    moveScheduledToDraft(id)
      .then((res) => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_moved',
            }),
          ),
        );

        // _getDrafts();
        // _getSchedules();
      })
      .catch((error) => {
        console.warn('Failed to move scheduled post to drafts');
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
      });
  };

  const _editDraft = (id) => {
    const selectedDraft = drafts.find((draft) => draft._id === id);

    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: `editor_draft_${id}`,
      params: {
        draft: selectedDraft,
        fetchPost: refetchDrafts,
      },
    });
  };

  const _isLoading = isLoadingDrafts
    || isLoadingSchedules 
    || isFetchingDrafts 
    || isFetchingSchedules 
    || isDeletingDraft 
    || isDeletingSchedule

  return (
    <DraftsScreen
      isLoading={_isLoading}
      editDraft={_editDraft}
      currentAccount={currentAccount}
      drafts={drafts}
      schedules={schedules}
      removeDraft={deleteDraft}
      moveScheduleToDraft={_moveScheduleToDraft}
      removeSchedule={deleteSchedule}
      onRefresh={_onRefresh}
      initialTabIndex={initialTabIndex}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(DraftsContainer));


