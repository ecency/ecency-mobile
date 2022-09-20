import React, { useState, useRef } from 'react';
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
import { OptionsModal } from '../../../components/atoms';

const DraftsScreen = ({
  currentAccount,
  removeDraft,
  editDraft,
  removeSchedule,
  isLoading,
  onRefresh,
  intl,
  drafts,
  schedules,
  moveScheduleToDraft,
  initialTabIndex,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const ActionSheetRef = useRef(null);

  const _onActionPress = (index) => {
    if (index === 0) {
      moveScheduleToDraft(selectedId);
    }
  };

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

    const _onItemPress = () => {
      if (isSchedules) {
        setSelectedId(item._id);
        if (ActionSheetRef.current) {
          ActionSheetRef.current.show();
        }
      } else {
        editDraft(item._id);
      }
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
        handleOnRemoveItem={isSchedules ? removeSchedule : removeDraft}
        id={item._id}
        key={item._id}
        status={item.status}
        isSchedules={isSchedules}
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

  const _getTabItem = (data, type) => (
    <View style={globalStyles.lightContainer}>
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        removeClippedSubviews={false}
        renderItem={({ item }) => _renderItem(item, type)}
        ListEmptyComponent={_renderEmptyContent()}
        refreshControl={<RefreshControl onRefresh={onRefresh} refreshing={isLoading} />}
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
      <OptionsModal
        ref={ActionSheetRef}
        title={intl.formatMessage({
          id: 'alert.move_question',
        })}
        options={[
          intl.formatMessage({
            id: 'alert.move',
          }),
          intl.formatMessage({
            id: 'alert.cancel',
          }),
        ]}
        cancelButtonIndex={1}
        onPress={_onActionPress}
      />
    </View>
  );
};

export default injectIntl(DraftsScreen);
