import React, { useMemo, useRef, useCallback } from 'react';
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

const DraftsScreen = ({
  currentAccount,
  removeDraft,
  editDraft,
  removeSchedule,
  isLoading,
  isDeleting,
  isBatchDeleting,
  onRefresh,
  intl,
  drafts,
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
  fetchNextSchedulesPage,
  hasNextSchedulesPage,
  isFetchingNextSchedulesPage,
}) => {
  const actionSheet = useRef(null);
  const draftsListRef = useRef<FlatList>(null);
  const schedulesListRef = useRef<FlatList>(null);
  const isDarkTheme = useAppSelector(selectIsDarkTheme);

  // Use specific draft selector instead of entire draftsCollection
  const idLessDraftId = DEFAULT_USER_DRAFT_ID + currentAccount?.username;
  const _idLessDraft = useAppSelector(selectDraftById(idLessDraftId));

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

      const _onItemPress = () => {
        if (!isSchedules) {
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
          title={item.title}
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

  const _renderEmptyContent = () => {
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
          id: 'drafts.empty_list',
        })}
      </Text>
    );
  };

  const _renderHeader = useCallback(() => {
    return _renderItem(processedIdLessDraft, 'unsaved');
  }, [_renderItem, processedIdLessDraft]);

  // Constants for FlatList optimization
  const ITEM_HEIGHT = 120; // Estimated item height for getItemLayout

  const _getTabItem = useCallback(
    (data, type, listRef) => {
      const isDraftsTab = type === 'drafts';
      const fetchNextPage = isDraftsTab ? fetchNextDraftsPage : fetchNextSchedulesPage;
      const hasNextPage = isDraftsTab ? hasNextDraftsPage : hasNextSchedulesPage;
      const isFetchingNextPage = isDraftsTab
        ? isFetchingNextDraftsPage
        : isFetchingNextSchedulesPage;

      const handleLoadMore = () => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      };

      const getItemLayout = (_data: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      });

      const renderItem = ({ item }: { item: any }) => _renderItem(item, type);

      return (
        <View style={globalStyles.lightContainer}>
          <FlatList
            ref={listRef}
            data={data}
            keyExtractor={(item) => item._id}
            removeClippedSubviews={true}
            getItemLayout={getItemLayout}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            windowSize={21}
            renderItem={renderItem}
            ListHeaderComponent={isDraftsTab && processedIdLessDraft ? _renderHeader : null}
            ListEmptyComponent={_renderEmptyContent()}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isFetchingNextPage ? <PostCardPlaceHolder /> : null}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
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
      processedIdLessDraft,
      isLoading,
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
      }
    },
    [processedDrafts, processedSchedules, _getTabItem],
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
          navigationState={{ index, routes }}
          style={globalStyles.tabView}
          onIndexChange={setIndex}
          renderTabBar={(tabProps) => (
            <TabBar
              {...tabProps}
              onTabPress={({ route }) => {
                const listRef = route.key === 'schedules' ? schedulesListRef : draftsListRef;
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
