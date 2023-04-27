import React, { useState } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services and Actions
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  useDraftCloneMutation,
  useDraftDeleteMutation,
  useGetDraftsQuery,
  useGetSchedulesQuery,
  useMoveScheduleToDraftsMutation,
  useScheduleDeleteMutation,
} from '../../../providers/queries';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Component
import DraftsScreen from '../screen/draftsScreen';

const DraftsContainer = ({ currentAccount, navigation, route }) => {
  const { mutate: _cloneDraft, isLoading: isCloningDraft } = useDraftCloneMutation();
  const { mutate: deleteDraft, isLoading: isDeletingDraft } = useDraftDeleteMutation();
  const { mutate: deleteSchedule, isLoading: isDeletingSchedule } = useScheduleDeleteMutation();
  const { mutate: moveScheduleToDrafts, isLoading: isMovingToDrafts } =
    useMoveScheduleToDraftsMutation();

  const {
    isLoading: isLoadingDrafts,
    data: drafts = [],
    isFetching: isFetchingDrafts,
    refetch: refetchDrafts,
  } = useGetDraftsQuery();

  const {
    isLoading: isLoadingSchedules,
    data: schedules = [],
    isFetching: isFetchingSchedules,
    refetch: refetchSchedules,
  } = useGetSchedulesQuery();

  const [initialTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

  // Component Functions
  const _onRefresh = () => {
    refetchDrafts();
    refetchSchedules();
  };

  const _editDraft = (id: string) => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: `editor_draft_${id}`,
      params: {
        draftId: id,
      },
    });
  };

  const _isLoading =
    isLoadingDrafts || isLoadingSchedules || isFetchingDrafts || isFetchingSchedules;

  const _isDeleting = isDeletingDraft || isDeletingSchedule || isMovingToDrafts;

  const _isCloning = isCloningDraft;

  return (
    <DraftsScreen
      isLoading={_isLoading}
      isDeleting={_isDeleting}
      editDraft={_editDraft}
      currentAccount={currentAccount}
      drafts={drafts}
      schedules={schedules}
      removeDraft={deleteDraft}
      moveScheduleToDraft={moveScheduleToDrafts}
      removeSchedule={deleteSchedule}
      onRefresh={_onRefresh}
      initialTabIndex={initialTabIndex}
      cloneDraft={_cloneDraft}
      isCloning={_isCloning}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default gestureHandlerRootHOC(injectIntl(connect(mapStateToProps)(DraftsContainer)));
