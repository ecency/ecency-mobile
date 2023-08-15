import React, { useState } from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';

// Services and Actions
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import {
  useAddDraftMutation,
  useDraftDeleteMutation,
  useDraftsBatchDeleteMutation,
  useGetDraftsQuery,
  useGetSchedulesQuery,
  useMoveScheduleToDraftsMutation,
  useScheduleDeleteMutation,
  useSchedulesBatchDeleteMutation,
} from '../../../providers/queries';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
import { DraftTypes } from '../../../constants/draftTypes';

// Utilities

// Component
import DraftsScreen from '../screen/draftsScreen';

const DraftsContainer = ({ currentAccount, navigation, route }) => {
  const { mutate: _cloneDraft, isLoading: isCloningDraft } = useAddDraftMutation();
  const { mutate: deleteDraft, isLoading: isDeletingDraft } = useDraftDeleteMutation();
  const { mutate: deleteSchedule, isLoading: isDeletingSchedule } = useScheduleDeleteMutation();
  const { mutate: moveScheduleToDrafts, isLoading: isMovingToDrafts } =
    useMoveScheduleToDraftsMutation();
  const draftsBatchDeleteMutation = useDraftsBatchDeleteMutation();
  const schedulesBatchDeleteMutation = useSchedulesBatchDeleteMutation();

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
  const [batchSelectedDrafts, setBatchSelectedDrafts] = useState<string[]>([]);
  const [batchSelectedSchedules, setBatchSelectedSchedules] = useState<string[]>([]);
  // const [selectedTabIndex, setSelectedTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

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

  const _getUpdatedArray = (arr: string[], id: string) => {
    let _tempArr = arr.slice();
    const index = _tempArr.findIndex((item) => item === id);

    if (index !== -1) {
      // Object exists in array, so remove it
      _tempArr.splice(index, 1);
    } else {
      // Object doesn't exist in array, so push it
      _tempArr.push(id);
    }
    return _tempArr;
  };
  const _handleItemLongPress = (id, type) => {
    if (type === DraftTypes.DRAFTS) {
      setBatchSelectedDrafts(_getUpdatedArray(batchSelectedDrafts, id));
    } else if (type === DraftTypes.SCHEDULES) {
      setBatchSelectedSchedules(_getUpdatedArray(batchSelectedSchedules, id));
    }
  };

  const _handleBatchDelete = async () => {
    if (batchSelectedDrafts && batchSelectedDrafts.length > 0) {
      draftsBatchDeleteMutation.mutate(batchSelectedDrafts, {
        onSettled: () => {
          console.log('drafts deleted successfully!');
          setBatchSelectedDrafts([]);
        },
      });
    }
    if (batchSelectedSchedules && batchSelectedSchedules.length > 0) {
      schedulesBatchDeleteMutation.mutate(batchSelectedSchedules, {
        onSettled: () => {
          console.log('schedules deleted successfully!');
          setBatchSelectedSchedules([]);
        },
      });
    }
  };

  // const _onChangeTab = ({ i, ref }) => {
  //   setSelectedTabIndex(i);
  // };

  return (
    <DraftsScreen
      isLoading={_isLoading}
      isDeleting={_isDeleting}
      isBatchDeleting={
        draftsBatchDeleteMutation.isLoading || schedulesBatchDeleteMutation.isLoading
      }
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
      handleItemLongPress={_handleItemLongPress}
      batchSelectedItems={[...batchSelectedDrafts, ...batchSelectedSchedules]}
      handleBatchDeletePress={_handleBatchDelete}
      // onChangeTab={_onChangeTab}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default gestureHandlerRootHOC(injectIntl(connect(mapStateToProps)(DraftsContainer)));
