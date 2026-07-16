import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text, Platform, RefreshControl } from 'react-native';
import { default as AnimatedView, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import EStyleSheet from 'react-native-extended-stylesheet';

// Utils
import { postBodySummary } from '@ecency/render-helper';
import { TabView } from 'react-native-tab-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { catchImageFromMetadata, catchDraftImage } from '../../../utils/image';
import { getFormatedCreatedDate } from '../../../utils/time';
import { templateDisplayName } from '../../../utils/draftTemplates';

// Components
import {
  BasicHeader,
  TabBar,
  DraftListItem,
  PostCardPlaceHolder,
  IconButton,
} from '../../../components';
import { OptionsModal } from '../../../components/atoms';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './draftStyles';
import { useAppSelector } from '../../../hooks';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';
import { selectIsDarkTheme, selectDraftById } from '../../../redux/selectors';

// Bounds the empty-tab page waterfall (templates are sparse among drafts)
const AUTO_FETCH_PAGE_BUDGET = 5;

const DraftsScreen = ({
  currentAccount,
  removeDraft,
  editDraft,
  applyTemplate,
  removeSchedule,
  isLoading,
  refreshing,
  isDeleting,
  isBatchDeleting,
  onRefresh,
  intl,
  drafts,
  templates,
  schedules,
  moveScheduleToDraft,
  initialTabIndex,
  cloneDraft,
  isCloning,
  handleItemLongPress,
  batchSelectedItems,
  handleBatchDeletePress,
  fetchNextDraftsPage,
  hasNextDraftsPage,
  isFetchingNextDraftsPage,
  draftsPagesLoaded,
  fetchNextSchedulesPage,
  hasNextSchedulesPage,
  isFetchingNextSchedulesPage,
}) => {
  const actionSheet = useRef(null);
  const draftsListRef = useRef<FlatList>(null);
  const schedulesListRef = useRef<FlatList>(null);
  const templatesListRef = useRef<FlatList>(null);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  // Use specific draft selector instead of entire draftsCollection
  const idLessDraftId = DEFAULT_USER_DRAFT_ID + currentAccount?.name;
  const idLessDraftSelector = useMemo(() => selectDraftById(idLessDraftId), [idLessDraftId]);
  const _idLessDraft = useAppSelector(idLessDraftSelector);

  const idLessDraft = useMemo(() => {
    // if idless unsaved draft exist load that first.
    if (
      _idLessDraft &&
      _idLessDraft.updated > 0 &&
      (_idLessDraft.title !== '' || _idLessDraft.tags !== '' || _idLessDraft.body !== '')
    ) {
      return _idLessDraft;
    }
    return null;
  }, [_idLessDraft]);

  const [index, setIndex] = React.useState(initialTabIndex);

  // onEndReached never fires on an empty list, so when the ACTIVE tab has no
  // items while more draft pages remain (templates live among drafts on the
  // server), fetch ahead, bounded to a few pages.
  useEffect(() => {
    const activeListEmpty =
      (index === 0 && drafts.length === 0) || (index === 2 && templates.length === 0);
    if (
      activeListEmpty &&
      hasNextDraftsPage &&
      !isFetchingNextDraftsPage &&
      draftsPagesLoaded < AUTO_FETCH_PAGE_BUDGET
    ) {
      fetchNextDraftsPage();
    }
  }, [
    index,
    drafts.length,
    templates.length,
    hasNextDraftsPage,
    isFetchingNextDraftsPage,
    draftsPagesLoaded,
    fetchNextDraftsPage,
  ]);
  const [routes] = React.useState([
    {
      key: 'drafts',
      title: intl.formatMessage({
        id: 'drafts.title',
      }),
    },
    {
      key: 'schedules',
      title: intl.formatMessage({
        id: 'schedules.title',
      }),
    },
    {
      key: 'templates',
      title: intl.formatMessage({
        id: 'templates.title',
      }),
    },
  ]);

  // Pre-compute draft data ONCE - move heavy processing out of _renderItem
  const processedDrafts = useMemo(() => {
    return drafts.map((item) => {
      const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
      const tag = tags[0] || '';

      // if meta exist, get 1st image from meta else get 1st image from body
      const image =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta)
          : catchDraftImage(item.body);
      const thumbnail =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta, 'match', true)
          : catchDraftImage(item.body, 'match', true);
      const summary = postBodySummary({ ...item, last_update: item.modified }, 100, Platform.OS);

      return {
        ...item,
        _processedTag: tag,
        _processedImage: image,
        _processedThumbnail: thumbnail,
        _processedSummary: summary,
      };
    });
  }, [drafts]);

  // Pre-compute template data ONCE
  const processedTemplates = useMemo(() => {
    return templates.map((item) => {
      const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
      const tag = tags[0] || '';

      const image =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta)
          : catchDraftImage(item.body);
      const thumbnail =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta, 'match', true)
          : catchDraftImage(item.body, 'match', true);
      const summary = postBodySummary({ ...item, last_update: item.modified }, 100, Platform.OS);

      return {
        ...item,
        _processedTag: tag,
        _processedImage: image,
        _processedThumbnail: thumbnail,
        _processedSummary: summary,
        _processedTitle:
          templateDisplayName(item) || intl.formatMessage({ id: 'templates.untitled' }),
      };
    });
  }, [templates, intl]);

  // Pre-compute schedule data ONCE
  const processedSchedules = useMemo(() => {
    return schedules.map((item) => {
      const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
      const tag = tags[0] || '';

      const image =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta)
          : catchDraftImage(item.body);
      const thumbnail =
        item.meta && item.meta.image
          ? catchImageFromMetadata(item.meta, 'match', true)
          : catchDraftImage(item.body, 'match', true);
      const summary = postBodySummary({ ...item, last_update: item.modified }, 100, Platform.OS);

      return {
        ...item,
        _processedTag: tag,
        _processedImage: image,
        _processedThumbnail: thumbnail,
        _processedSummary: summary,
      };
    });
  }, [schedules]);

  // Pre-compute idLessDraft data if it exists
  const processedIdLessDraft = useMemo(() => {
    if (!idLessDraft) return null;

    const tags = idLessDraft.tags ? idLessDraft.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';

    const image =
      idLessDraft.meta && idLessDraft.meta.image
        ? catchImageFromMetadata(idLessDraft.meta)
        : catchDraftImage(idLessDraft.body);
    const thumbnail =
      idLessDraft.meta && idLessDraft.meta.image
        ? catchImageFromMetadata(idLessDraft.meta, 'match', true)
        : catchDraftImage(idLessDraft.body, 'match', true);
    const summary = postBodySummary(
      { ...idLessDraft, last_update: idLessDraft.modified },
      100,
      Platform.OS,
    );

    return {
      ...idLessDraft,
      _processedTag: tag,
      _processedImage: image,
      _processedThumbnail: thumbnail,
      _processedSummary: summary,
    };
  }, [idLessDraft]);

  // Component Functions - now with pre-computed data
  const _renderItem = useCallback(
    (item, type) => {
      const isSchedules = type === 'schedules';
      const isUnsaved = type === 'unsaved';
      const isTemplates = type === 'templates';

      const _onItemPress = () => {
        if (isTemplates) {
          applyTemplate(item);
        } else if (!isSchedules) {
          editDraft(item._id);
        }
      };

      const _handleLongPress = () => {
        handleItemLongPress && handleItemLongPress(item._id, type);
      };

      return (
        <DraftListItem
          created={isSchedules ? getFormatedCreatedDate(item.schedule) : item.created}
          mainTag={item._processedTag}
          title={isTemplates ? item._processedTitle : item.title}
          summary={item._processedSummary}
          isFormatedDate={isSchedules}
          image={item._processedImage ? { uri: item._processedImage } : null}
          thumbnail={item._processedThumbnail ? { uri: item._processedThumbnail } : null}
          username={currentAccount.name}
          reputation={currentAccount.reputation}
          handleOnPressItem={_onItemPress}
          handleOnMovePress={moveScheduleToDraft}
          handleOnRemoveItem={isSchedules ? removeSchedule : removeDraft}
          id={item._id}
          key={item._id}
          status={item.status}
          isSchedules={isSchedules}
          isTemplate={isTemplates}
          isDeleting={isDeleting}
          isUnsaved={isUnsaved}
          handleOnClonePressed={cloneDraft}
          draftItem={item}
          isCloning={isCloning}
          handleLongPress={_handleLongPress}
          isSelected={batchSelectedItems.find((batchItem) => batchItem === item._id)}
          batchSelectionActive={batchSelectedItems && batchSelectedItems.length > 0}
        />
      );
    },
    [
      currentAccount.name,
      currentAccount.reputation,
      editDraft,
      applyTemplate,
      moveScheduleToDraft,
      removeSchedule,
      removeDraft,
      isDeleting,
      cloneDraft,
      isCloning,
      handleItemLongPress,
      batchSelectedItems,
    ],
  );

  const _renderEmptyContent = useCallback(
    (type) => {
      if (isLoading) {
        return (
          <View>
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </View>
        );
      }

      return (
        <Text style={globalStyles.hintText}>
          {intl.formatMessage({
            id: type === 'templates' ? 'templates.empty_list' : 'drafts.empty_list',
          })}
        </Text>
      );
    },
    [intl, isLoading],
  );

  const _renderHeader = useCallback(() => {
    return _renderItem(processedIdLessDraft, 'unsaved');
  }, [_renderItem, processedIdLessDraft]);

  const _getTabItem = useCallback(
    (data, type, listRef) => {
      const isDraftsTab = type === 'drafts';
      const isSchedulesTab = type === 'schedules';
      // drafts and templates tabs are fed by the same infinite query
      const fetchNextPage = isSchedulesTab ? fetchNextSchedulesPage : fetchNextDraftsPage;
      const hasNextPage = isSchedulesTab ? hasNextSchedulesPage : hasNextDraftsPage;
      const isFetchingNextPage = isSchedulesTab
        ? isFetchingNextSchedulesPage
        : isFetchingNextDraftsPage;

      const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      };

      const renderItem = ({ item }: { item: any }) => _renderItem(item, type);

      return (
        <View style={globalStyles.lightContainer}>
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item._id}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={21}
            renderItem={renderItem}
            ListHeaderComponent={isDraftsTab && processedIdLessDraft ? _renderHeader : null}
            ListEmptyComponent={() => _renderEmptyContent(type)}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <PostCardPlaceHolder /> : null}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                progressBackgroundColor="#357CE6"
                tintColor={!isDarkTheme ? '#357ce6' : '#96c0ff'}
                titleColor="#fff"
                colors={['#fff']}
              />
            }
          />
        </View>
      );
    },
    [
      fetchNextDraftsPage,
      fetchNextSchedulesPage,
      hasNextDraftsPage,
      hasNextSchedulesPage,
      isFetchingNextDraftsPage,
      isFetchingNextSchedulesPage,
      _renderItem,
      _renderHeader,
      _renderEmptyContent,
      processedIdLessDraft,
      refreshing,
      onRefresh,
      isDarkTheme,
    ],
  );

  const _renderDeleteButton = () => {
    return (
      <AnimatedView.View
        entering={SlideInRight}
        exiting={SlideOutRight}
        style={styles.deleteButtonContainer}
      >
        <SafeAreaView>
          <IconButton
            style={styles.deleteButton}
            color={EStyleSheet.value('$pureWhite')}
            iconType="MaterialCommunityIcons"
            name="delete-outline"
            disabled={isBatchDeleting}
            size={28}
            onPress={() => actionSheet?.current?.show()}
            isLoading={isBatchDeleting}
          />
        </SafeAreaView>
      </AnimatedView.View>
    );
  };

  const renderScene = useCallback(
    ({ route }) => {
      switch (route.key) {
        case 'drafts':
          return (
            <View style={styles.tabbarItem}>
              {_getTabItem(processedDrafts, 'drafts', draftsListRef)}
            </View>
          );
        case 'schedules':
          return (
            <View style={styles.tabbarItem}>
              {_getTabItem(processedSchedules, 'schedules', schedulesListRef)}
            </View>
          );
        case 'templates':
          return (
            <View style={styles.tabbarItem}>
              {_getTabItem(processedTemplates, 'templates', templatesListRef)}
            </View>
          );
      }
    },
    [processedDrafts, processedSchedules, processedTemplates, _getTabItem],
  );

  return (
    <>
      <SafeAreaView style={globalStyles.container}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'drafts.title',
          })}
        />

        <TabView
          lazy
          navigationState={{ index, routes }}
          style={globalStyles.tabView}
          onIndexChange={setIndex}
          renderTabBar={(tabProps) => (
            <TabBar
              {...tabProps}
              onTabPress={({ route }) => {
                const listRef =
                  route.key === 'schedules'
                    ? schedulesListRef
                    : route.key === 'templates'
                    ? templatesListRef
                    : draftsListRef;
                listRef.current?.scrollToOffset({ offset: 0, animated: true });
              }}
            />
          )}
          renderScene={renderScene}
          commonOptions={{
            labelStyle: styles.tabLabelColor,
          }}
        />

        {batchSelectedItems && batchSelectedItems.length > 0 ? _renderDeleteButton() : null}
      </SafeAreaView>
      <OptionsModal
        ref={actionSheet}
        options={[
          intl.formatMessage({ id: 'alert.delete' }),
          intl.formatMessage({ id: 'alert.cancel' }),
        ]}
        title={intl.formatMessage({ id: 'alert.remove_all_alert' })}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={(index) => {
          if (index === 0) {
            handleBatchDeletePress && handleBatchDeletePress();
          }
        }}
      />
    </>
  );
};

export default injectIntl(DraftsScreen);
