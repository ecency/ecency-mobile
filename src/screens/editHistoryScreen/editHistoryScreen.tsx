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
import { BasicHeader, Icon, PostBody } from '../../components';
import { diff_match_patch } from 'diff-match-patch';

// styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './editHistoryScreenStyles';
import { getCommentHistory } from '../../providers/ecency/ecency';
import { CommentHistoryItem } from '../../providers/ecency/ecency.types';
import { dateToFormatted } from '../../utils/time';
import { renderPostBody } from '@ecency/render-helper';

export interface CommentHistoryListItemDiff {
  title: string;
  titleDiff?: string;
  body: string;
  bodyDiff?: string;
  tags: string;
  tagsDiff?: string;
  timestamp: string;
  v: number;
}

const dmp = new diff_match_patch();

const make_diff = (str1: string, str2: string): string => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, '&nbsp;');
};

const screenWidth = Dimensions.get('window').width - 32;

const EditHistoryScreen = ({ navigation }) => {
  const { author, permlink } = navigation.state.params;
  const intl = useIntl();
  const [editHistory, setEditHistory] = useState<CommentHistoryListItemDiff[]>([]);
  const [versionSelected, setVersionSelected] = useState(1);
  const [showDiff, setShowDiff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    _getCommentHistory();
  }, []);

  const buildList = (raw: CommentHistoryItem[]) => {
    const t = [];

    let h = '';
    for (let l = 0; l < raw.length; l += 1) {
      if (raw[l].body.startsWith('@@')) {
        const p = dmp.patch_fromText(raw[l].body);
        h = dmp.patch_apply(p, h)[0] as any;
        raw[l].body = h;
      } else {
        h = raw[l].body;
      }

      t.push({
        v: raw[l].v,
        title: raw[l].title,
        body: h,
        timestamp: raw[l].timestamp,
        tags: raw[l].tags.join(', '),
      });
    }

    for (let l = 0; l < t.length; l += 1) {
      const p = l > 0 ? l - 1 : l;

      t[l].titleDiff = make_diff(t[p].title, t[l].title);
      t[l].bodyDiff = make_diff(t[p].body, t[l].body);
      t[l].tagsDiff = make_diff(t[p].tags, t[l].tags);
    }

    return t;
  };

  const _getCommentHistory = async () => {
    const responseData = await getCommentHistory(author, permlink);
    if (!responseData) {
      Alert.alert('No History found!');
      return;
    }
    setEditHistory(buildList(responseData));
  };
  console.log('author, permlink : ', author, permlink);
  console.log('editHistory : ', editHistory);

  const _renderVersionsListItem = ({
    item,
    index,
  }: {
    item: CommentHistoryListItemDiff;
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
              : EStyleSheet.value('$primaryLightGray'),
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

  const _renderDiff = (item: CommentHistoryListItemDiff) => {
    return (
      <View style={styles.diffContainer}>
        <Text style={styles.titleDiff}>{item.titleDiff}</Text>
        <View style={styles.tagsContainer}>
          <Icon style={styles.tagIcon} iconType="AntDesign" name={'tag'} />
          <Text style={styles.tags}>{item.tagsDiff}</Text>
        </View>
        <Text style={styles.bodyDiff}>{item.bodyDiff}</Text>
      </View>
    );
  };

  const _renderPreview = (selectedItem: CommentHistoryListItemDiff) => {
    const previewBody = renderPostBody(
      selectedItem.body,
      true,
      Platform.OS === 'ios' ? false : true,
    );
    return (
      <>
        <View style={styles.postHeaderContainer}>
          <Text style={styles.postHeaderTitle}>{selectedItem.title}</Text>
          <View style={styles.tagsContainer}>
            <Icon style={styles.tagIcon} iconType="AntDesign" name={'tag'} />
            <Text style={styles.tags}>{selectedItem.tags}</Text>
          </View>
        </View>
        <View style={styles.bodyContainer}>
          <PostBody body={previewBody} onLoadEnd={() => setIsLoading(false)} width={screenWidth} />
        </View>
      </>
    );
  };
  const _renderBody = () => {
    const selectedItem = editHistory.find((x) => x.v === versionSelected);
    if (!selectedItem) {
      return null;
    }

    return (
      <ScrollView
        style={[styles.previewScroll]}
        contentContainerStyle={styles.previewScrollContentContainer}
      >
        {showDiff ? _renderDiff(selectedItem) : _renderPreview(selectedItem)}
      </ScrollView>
    );
  };

  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({
          id: 'history.edit',
        })}
        iconType="Ionicons"
        rightIconName="git-compare-sharp"
        rightIconBtnStyle={[
          styles.rightIcon,
          {
            backgroundColor: showDiff
              ? EStyleSheet.value('$primaryBlue')
              : EStyleSheet.value('$primaryLightGray'),
          },
        ]}
        rightIconStyle={{
          color: showDiff ? EStyleSheet.value('white') : EStyleSheet.value('$iconColor'),
        }}
        handleRightIconPress={() => setShowDiff(!showDiff)}
      />
      <View style={styles.mainContainer}>
        {editHistory.length > 0 && _renderVersionsList()}
        {editHistory.length > 0 && _renderBody()}
      </View>
    </Fragment>
  );
};

export default EditHistoryScreen;
