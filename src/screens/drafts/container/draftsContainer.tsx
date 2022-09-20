import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { injectIntl } from 'react-intl';

// Services and Actions
import {
  deleteDraft,
  moveScheduledToDraft,
  deleteScheduledPost,
} from '../../../providers/ecency/ecency';
import { toastNotification } from '../../../redux/actions/uiAction';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import DraftsScreen from '../screen/draftsScreen';
import { useGetDraftsQuery, useGetSchedulesQuery } from '../../../providers/queries/draftQueries';



const DraftsContainer = ({ currentAccount, intl, navigation, dispatch, route }) => {

  const { 
    isLoading, 
    data: drafts = [], 
    isFetching, 
    refetch:refetchDrafts 
  } = useGetDraftsQuery();

  const { 
    data: schedules = [], 
    refetch:refetchSchedules 
  } = useGetSchedulesQuery();

  const [initialTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

  // Component Functions
  const _onRefresh = () => {
    refetchDrafts();
    refetchSchedules();
  }

  const _removeDraft = (id) => {
    deleteDraft(id)
      .then(() => {
        const newDrafts = [...drafts].filter((draft) => draft._id !== id);
        // setDrafts(_sortData(newDrafts));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

  const _removeSchedule = (id) => {
    deleteScheduledPost(id)
      .then((res) => {
        const newSchedules = [...schedules].filter((schedule) => schedule._id !== id);

        // setSchedules(_sortDataS(newSchedules));
      })
      .catch(() => {
        Alert.alert(intl.formatMessage({ id: 'alert.fail' }));
      });
  };

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




  return (
    <DraftsScreen
      isLoading={isLoading || isFetching}
      isFetching={isFetching}
      editDraft={_editDraft}
      currentAccount={currentAccount}
      drafts={drafts}
      schedules={schedules}
      removeDraft={_removeDraft}
      moveScheduleToDraft={_moveScheduleToDraft}
      removeSchedule={_removeSchedule}
      onRefresh={_onRefresh}
      initialTabIndex={initialTabIndex}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default injectIntl(connect(mapStateToProps)(DraftsContainer));


