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
} from '../../../providers/queries';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

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
  const [batchSelectedItems, setBatchSelectedItems] = useState<any>([]);
  const [selectedTabIndex, setSelectedTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

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

  const _handleItemLongPress = (id, type) => {
    console.log('id, type : ', id, type);
    let _batchSelectedItemsArr = batchSelectedItems.slice();
    const index = _batchSelectedItemsArr.findIndex((item) => item.id === id);

    if (index !== -1) {
      // Object exists in array, so remove it
      _batchSelectedItemsArr.splice(index, 1);
    } else {
      // Object doesn't exist in array, so push it
      _batchSelectedItemsArr.push({ id, type });
    }
    setBatchSelectedItems(_batchSelectedItemsArr);
  };

  const _handleBatchDelete = async () => {
    console.log('batch delete pressed');
    const filteredDraftsIds = batchSelectedItems
      .filter((item) => item.type === 'drafts')
      .map((item) => item.id);
    // const filteredSchedulesIds = batchSelectedItems
    //   .filter((item) => item.type === 'schedules')
    //   .map((item) => item.id);
    console.log('filteredDraftsIds : ', JSON.stringify(filteredDraftsIds, null, 2));

    draftsBatchDeleteMutation.mutate(filteredDraftsIds, {
      onSettled: () => {
        console.log('drafts deleted successfully!');
      },
    });
  };

  const _onChangeTab = ({ i, ref }) => {
    console.log('index : ', JSON.stringify(i, null, 2));
    setSelectedTabIndex(i);
  };
  console.log('selectedTabIndex : ', selectedTabIndex);

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
      handleItemLongPress={_handleItemLongPress}
      batchSelectedItems={batchSelectedItems}
      handleBatchDeletePress={_handleBatchDelete}
      onChangeTab={_onChangeTab}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: state.account.currentAccount,
});

export default gestureHandlerRootHOC(injectIntl(connect(mapStateToProps)(DraftsContainer)));
