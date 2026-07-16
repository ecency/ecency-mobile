import React, { useMemo, useRef, useState } from 'react';
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
import { selectCurrentAccount } from '../../../redux/selectors';
import { isTemplateDraft } from '../../../utils/draftTemplates';

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
    data: allDrafts = [],
    refetch: refetchDrafts,
    fetchNextPage: fetchNextDraftsPage,
    hasNextPage: hasNextDraftsPage,
    isFetchingNextPage: isFetchingNextDraftsPage,
    pagesLoaded: draftsPagesLoaded,
  } = useGetDraftsQuery();

  // template drafts (meta.postTemplate) share the drafts query but render in their own tab
  const drafts = useMemo(() => allDrafts.filter((item) => !isTemplateDraft(item)), [allDrafts]);
  const templates = useMemo(() => allDrafts.filter((item) => isTemplateDraft(item)), [allDrafts]);

  const {
    isLoading: isLoadingSchedules,
    data: schedules = [],
    refetch: refetchSchedules,
    fetchNextPage: fetchNextSchedulesPage,
    hasNextPage: hasNextSchedulesPage,
    isFetchingNextPage: isFetchingNextSchedulesPage,
  } = useGetSchedulesQuery();

  const [initialTabIndex] = useState(route.params?.showSchedules ? 1 : 0);
  const [batchSelectedDrafts, setBatchSelectedDrafts] = useState<string[]>([]);
  const [batchSelectedSchedules, setBatchSelectedSchedules] = useState<string[]>([]);
  // const [selectedTabIndex, setSelectedTabIndex] = useState(route.params?.showSchedules ? 1 : 0);

  // Spinner state for an explicit pull only; background refetches (stale mount,
  // next-page, invalidations) must not drop the RefreshControl down on their own.
  // The ref guards against overlapping pulls so a faster call can't clear the
  // spinner while another refresh is still running.
  const [refreshing, setRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  // Component Functions
  const _onRefresh = async () => {
    if (isRefreshingRef.current) {
      return;
    }
    isRefreshingRef.current = true;
    setRefreshing(true);
    try {
      await Promise.all([refetchDrafts(), refetchSchedules()]);
    } finally {
      isRefreshingRef.current = false;
      setRefreshing(false);
    }
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

  // opens editor hydrated from the template as a new post instead of editing the template
  const _applyTemplate = (template: any) => {
    navigation.navigate({
      name: ROUTES.SCREENS.EDITOR,
      key: `editor_template_${template._id}`,
      params: {
        templateDraft: template,
      },
    });
  };

  // initial load only — used for list placeholders, not the pull spinner
  const _isLoading = isLoadingDrafts || isLoadingSchedules;

  const _isDeleting = isDeletingDraft || isDeletingSchedule || isMovingToDrafts;

  const _isCloning = isCloningDraft;

  const _getUpdatedArray = (arr: string[], id: string) => {
    const _tempArr = arr.slice();
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
    if (type === DraftTypes.DRAFTS || type === DraftTypes.TEMPLATES) {
      // templates are drafts server-side, so they share the drafts batch delete flow
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

  // Wrap SDK mutations to convert raw string id to expected object format
  const _removeDraft = (id: string) => deleteDraft({ draftId: id });
  const _removeSchedule = (id: string) => deleteSchedule({ id });
  const _moveScheduleToDraft = (id: string) => moveScheduleToDrafts({ id });

  return (
    <DraftsScreen
      isLoading={_isLoading}
      refreshing={refreshing}
      isDeleting={_isDeleting}
      isBatchDeleting={
        draftsBatchDeleteMutation.isLoading || schedulesBatchDeleteMutation.isLoading
      }
      editDraft={_editDraft}
      applyTemplate={_applyTemplate}
      currentAccount={currentAccount}
      drafts={drafts}
      templates={templates}
      draftsPagesLoaded={draftsPagesLoaded}
      schedules={schedules}
      removeDraft={_removeDraft}
      moveScheduleToDraft={_moveScheduleToDraft}
      removeSchedule={_removeSchedule}
      onRefresh={_onRefresh}
      initialTabIndex={initialTabIndex}
      cloneDraft={_cloneDraft}
      isCloning={_isCloning}
      handleItemLongPress={_handleItemLongPress}
      batchSelectedItems={[...batchSelectedDrafts, ...batchSelectedSchedules]}
      handleBatchDeletePress={_handleBatchDelete}
      // Pagination props
      fetchNextDraftsPage={fetchNextDraftsPage}
      hasNextDraftsPage={hasNextDraftsPage}
      isFetchingNextDraftsPage={isFetchingNextDraftsPage}
      fetchNextSchedulesPage={fetchNextSchedulesPage}
      hasNextSchedulesPage={hasNextSchedulesPage}
      isFetchingNextSchedulesPage={isFetchingNextSchedulesPage}
      // onChangeTab={_onChangeTab}
    />
  );
};

const mapStateToProps = (state) => ({
  currentAccount: selectCurrentAccount(state),
});

export default gestureHandlerRootHOC(injectIntl(connect(mapStateToProps)(DraftsContainer)));
