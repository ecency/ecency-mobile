import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Alert,
  Dimensions,
  FlatList,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BasicHeader, PostBody } from '../../components';

// styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './editHistoryScreenStyles';
import { getCommentHistory } from '../../providers/ecency/ecency';
import { CommentHistoryItem } from '../../providers/ecency/ecency.types';
import { dateToFormatted } from '../../utils/time';
import { renderPostBody } from '@ecency/render-helper';

const screenWidth = Dimensions.get('window').width - 32;

const EditHistoryScreen = ({ navigation }) => {
  const { author, permlink } = navigation.state.params;
  const intl = useIntl();
  const [editHistory, setEditHistory] = useState<CommentHistoryItem[]>([]);
  const [versionSelected, setVersionSelected] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    _getCommentHistory();
  }, []);

  const _getCommentHistory = async () => {
    const responseData = await getCommentHistory(author, permlink);
    if (!responseData) {
      Alert.alert('No History found!');
      return;
    }
    setEditHistory(responseData);
  };
  console.log('author, permlink : ', author, permlink);
  console.log('editHistory : ', editHistory);

  const _renderVersionsListItem = ({
    item,
    index,
  }: {
    item: CommentHistoryItem;
    index: number;
  }) => {
    const selected = versionSelected === item.v;
    return (
      <TouchableOpacity
        onPress={() => setVersionSelected(item.v)}
        style={[
          styles.versionItemBtn,
          {
            backgroundColor: selected
              ? EStyleSheet.value('$primaryBlue')
              : EStyleSheet.value('$primaryDarkGray'),
          },
        ]}
      >
        <Text style={[styles.versionItemBtnText, { color: selected ? 'white' : 'black' }]}>
          {intl.formatMessage({
            id: 'history.version',
          })}
          {` ${item.v}`}
        </Text>
        <Text style={[styles.versionItemBtnDate, { color: selected ? 'white' : 'black' }]}>
          {dateToFormatted(item.timestamp, 'LL')}
        </Text>
      </TouchableOpacity>
    );
  };
  const _renderVersionsList = () => (
    <View style={styles.versionsListContainer}>
      <FlatList
        data={editHistory}
        keyExtractor={(item, index) => `item ${index}`}
        removeClippedSubviews={false}
        renderItem={_renderVersionsListItem}
        contentContainerStyle={styles.versionsListContentContainer}
        showsHorizontalScrollIndicator={false}
        horizontal
      />
    </View>
  );

  const _renderBody = () => {
    const selectedItem = editHistory.find((x) => x.v === versionSelected);
    if (!selectedItem) {
      return null;
    }
    const previewBody = renderPostBody(
      selectedItem.body,
      true,
      Platform.OS === 'ios' ? false : true,
    );

    return (
      <ScrollView
        style={[styles.previewScroll]}
        contentContainerStyle={styles.previewScrollContentContainer}
      >
        <View style={styles.bodyContainer}>
          <PostBody body={previewBody} onLoadEnd={() => setIsLoading(false)} width={screenWidth} />
        </View>
      </ScrollView>
    );
  };

  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'history.edit',
        })}
      />
      <View style={styles.mainContainer}>
        {editHistory.length > 0 && _renderVersionsList()}
        {editHistory.length > 0 && _renderBody()}
      </View>
    </Fragment>
  );
};

export default EditHistoryScreen;
