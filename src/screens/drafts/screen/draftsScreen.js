import React, { useState, useRef, useEffect } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import ActionSheet from 'react-native-actionsheet';

// Utils
import { postBodySummary } from '@esteemapp/esteem-render-helpers';
import { catchDraftImage } from '../../../utils/image';
import { getFormatedCreatedDate } from '../../../utils/time';

// Components
import { BasicHeader, TabBar, PostListItem, PostCardPlaceHolder } from '../../../components';

// Styles
import globalStyles from '../../../globalStyles';
import styles from './draftStyles';

const DraftsScreen = ({
  currentAccount,
  removeDraft,
  editDraft,
  removeSchedule,
  isLoading,
  intl,
  drafts,
  schedules,
  moveScheduleToDraft,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const ActionSheetRef = useRef(null);
  const firstMount = useRef(true);

  useEffect(() => {
    if (firstMount.current) {
      firstMount.current = false;
      return;
    }
    if (ActionSheetRef.current) {
      ActionSheetRef.current.show();
    }
  }, [selectedId]);

  // Component Functions

  const _renderItem = (item, type) => {
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';
    const image = catchDraftImage(item.body);
    const summary = postBodySummary({ item, last_update: item.created }, 100);
    const isSchedules = type === 'schedules';

    return (
      <PostListItem
        created={isSchedules ? getFormatedCreatedDate(item.schedule) : item.created}
        mainTag={tag}
        title={item.title}
        summary={summary}
        isFormatedDate={isSchedules}
        image={image ? { uri: catchDraftImage(item.body) } : null}
        username={currentAccount.name}
        reputation={currentAccount.reputation}
        handleOnPressItem={() => (isSchedules ? setSelectedId(item._id) : editDraft(item._id))}
        handleOnRemoveItem={isSchedules ? removeSchedule : removeDraft}
        id={item._id}
        key={item._id}
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
        keyExtractor={item => item._id}
        removeClippedSubviews={false}
        renderItem={({ item }) => _renderItem(item, type)}
        ListEmptyComponent={_renderEmptyContent()}
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
        style={globalStyles.tabView}
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
      <ActionSheet
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
        onPress={index => {
          index === 0 && moveScheduleToDraft(selectedId);
        }}
      />
    </View>
  );
};

export default injectIntl(DraftsScreen);
