import React, { Fragment } from 'react';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import {
  Alert,
  Dimensions,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BasicHeader, Icon, TextInput } from '../../components';
import { diff_match_patch } from 'diff-match-patch';

// styles
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from './editHistoryScreenStyles';
import { getCommentHistory } from '../../providers/ecency/ecency';
import { CommentHistoryItem } from '../../providers/ecency/ecency.types';
import { dateToFormatted } from '../../utils/time';
import AutoHeightWebView from 'react-native-autoheight-webview';

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
              : EStyleSheet.value('$iconColor'),
          },
        ]}
      >
        <Text style={[styles.versionItemBtnText, { color: EStyleSheet.value('$pureWhite') }]}>
          {intl.formatMessage({
            id: 'history.version',
          })}
          {` ${item.v}`}
        </Text>
        <Text style={[styles.versionItemBtnDate, { color: EStyleSheet.value('$pureWhite') }]}>
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
        <AutoHeightWebView source={{ html: item.titleDiff }} customStyle={customTitleStyle} />
        <View style={styles.tagsContainer}>
          <Icon style={styles.tagIcon} iconType="AntDesign" name={'tag'} />
          <AutoHeightWebView source={{ html: item.tagsDiff }} customStyle={customTagsStyle} />
        </View>
        <AutoHeightWebView source={{ html: item.bodyDiff }} customStyle={customBodyStyle} />
      </View>
    );
  };

  const _renderPlainBody = (selectedItem: CommentHistoryListItemDiff) => {
    return (
      <>
        <View style={styles.postHeaderContainer}>
          <TextInput
            value={selectedItem.title}
            style={styles.postHeaderTitle}
            multiline={true}
            editable={false}
          />
          <View style={styles.tagsContainer}>
            <Icon style={styles.tagIcon} iconType="AntDesign" name={'tag'} />
            <Text style={styles.tags}>{selectedItem.tags}</Text>
          </View>
        </View>
        <View style={styles.bodyContainer}>
          <TextInput
            value={selectedItem.body}
            style={styles.postBodyText}
            multiline={true}
            editable={false}
          />
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
        {showDiff ? _renderDiff(selectedItem) : _renderPlainBody(selectedItem)}
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
              : EStyleSheet.value('$iconColor'),
          },
        ]}
        rightIconStyle={{
          color: EStyleSheet.value('$pureWhite'),
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

const customTitleStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
    font-size: 25px;
    margin-bottom: 11px;
    font-weight: bold;
    line-height: 1.25;
  }
`;

const customTagsStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
    font-size: 16px;
    width: ${screenWidth - 12}px;
  }
`;

const customBodyStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
    font-size: 18px;
    width: ${screenWidth}px;

    overflow-wrap: break-word;
    word-wrap: break-word;

    -ms-word-break: break-all;
    word-break: break-all;
    word-break: break-word;

    -ms-hyphens: auto;
    -moz-hyphens: auto;
    -webkit-hyphens: auto;
    hyphens: auto;
  }
`;
