import React, { useMemo } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text, Platform, RefreshControl } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';

// Utils
import { postBodySummary } from '@ecency/render-helper';
import { catchImageFromMetadata, catchDraftImage } from '../../../utils/image';
import { getFormatedCreatedDate } from '../../../utils/time';

// Components
import { BasicHeader, TabBar, DraftListItem, PostCardPlaceHolder } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './draftStyles';
import { useAppSelector } from '../../../hooks';
import { DEFAULT_USER_DRAFT_ID } from '../../../redux/constants/constants';

const DraftsScreen = ({
  currentAccount,
  removeDraft,
  editDraft,
  removeSchedule,
  isLoading,
  isDeleting,
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
}) => {
  const isDarkTheme = useAppSelector((state) => state.application.isDarkTheme);
  const draftsCollection = useAppSelector((state) => state.cache.draftsCollection);

  const idLessDraft = useMemo(() => {
    // if idless unsaved draft exist load that first.
    const _idLessDraft =
      draftsCollection && draftsCollection[DEFAULT_USER_DRAFT_ID + currentAccount?.username];
    if (
      _idLessDraft &&
      _idLessDraft.updated > 0 &&
      (_idLessDraft.title !== '' || _idLessDraft.tags !== '' || _idLessDraft.body !== '')
    ) {
      return _idLessDraft;
    }
    return null;
  }, [draftsCollection]);

  // Component Functions
  const _renderItem = (item, type) => {
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';

    // if meta exist, get 1st image from meta else get 1st image from body
    const image =
      item.meta && item.meta.image ? catchImageFromMetadata(item.meta) : catchDraftImage(item.body);
    const thumbnail =
      item.meta && item.meta.image
        ? catchImageFromMetadata(item.meta, 'match', true)
        : catchDraftImage(item.body, 'match', true);
    const summary = postBodySummary({ ...item, last_update: item.modified }, 100, Platform.OS);
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
        mainTag={tag}
        title={item.title}
        summary={summary}
        isFormatedDate={isSchedules}
        image={image ? { uri: image } : null}
        thumbnail={thumbnail ? { uri: thumbnail } : null}
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
        isSelected={batchSelectedItems.find((batchItem) => batchItem.id === item._id)}
      />
    );
  };

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

  const _renderHeader = () => {
    return _renderItem(idLessDraft, 'unsaved');
  };

  const _getTabItem = (data, type) => (
    <View style={globalStyles.lightContainer}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        removeClippedSubviews={false}
        renderItem={({ item }) => _renderItem(item, type)}
        ListHeaderComponent={type === 'drafts' && idLessDraft && _renderHeader}
        ListEmptyComponent={_renderEmptyContent()}
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

  return (
    <View style={globalStyles.container}>
      <BasicHeader
        title={intl.formatMessage({
          id: 'drafts.title',
        })}
      />

      <ScrollableTabView
        style={[globalStyles.tabView, { paddingBottom: 40 }]}
        initialPage={initialTabIndex}
        renderTabBar={() => (
          <TabBar
            style={styles.tabbar}
            tabUnderlineDefaultWidth={80}
            tabUnderlineScaleX={2}
            tabBarPosition="overlayTop"
          />
        )}
      >
        <View
          tabLabel={intl.formatMessage({
            id: 'drafts.title',
          })}
          style={styles.tabbarItem}
        >
          {_getTabItem(drafts, 'drafts')}
        </View>
        <View
          tabLabel={intl.formatMessage({
            id: 'schedules.title',
          })}
          style={styles.tabbarItem}
        >
          {_getTabItem(schedules, 'schedules')}
        </View>
      </ScrollableTabView>
    </View>
  );
};

export default injectIntl(DraftsScreen);
