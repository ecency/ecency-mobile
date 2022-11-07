import React, { Fragment, useEffect, useState } from 'react';

import { useIntl } from 'react-intl';
import { Alert, FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import AutoHeightWebView from 'react-native-autoheight-webview';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { BasicHeader, Icon, PostPlaceHolder, TextInput } from '../../components';

// styles
import styles from './editHistoryScreenStyles';
import { getCommentHistory } from '../../providers/ecency/ecency';
import { dateToFormatted } from '../../utils/time';
import historyBuilder from './historyBuilder';
import getWindowDimensions from '../../utils/getWindowDimensions';

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

const screenWidth = getWindowDimensions().width - 32;

const EditHistoryScreen = ({ route }) => {
  const { author, permlink } = route.params ?? {};
  const intl = useIntl();
  const [editHistory, setEditHistory] = useState<CommentHistoryListItemDiff[]>([]);
  const [versionSelected, setVersionSelected] = useState(1);
  const [showDiff, setShowDiff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // webview styles for renderring diff
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

  const diffIconStyle = {
    color: showDiff ? EStyleSheet.value('$primaryBlue') : EStyleSheet.value('$iconColor'),
  };
  useEffect(() => {
    _getCommentHistory();
  }, []);

  const _getCommentHistory = async () => {
    setIsLoading(true);
    const responseData = await getCommentHistory(author, permlink);
    if (!responseData) {
      setIsLoading(false);
      Alert.alert('No History found!');
      return;
    }
    setEditHistory(historyBuilder(responseData));
    setIsLoading(false);
  };

  const _renderVersionsListItem = ({
    item,
  }: {
    item: CommentHistoryListItemDiff;
    index: number;
  }) => {
    const selected = versionSelected === item.v;
    const btnStyle = [
      styles.versionItemBtn,
      {
        backgroundColor: selected
          ? EStyleSheet.value('$primaryBlue')
          : EStyleSheet.value('$iconColor'),
      },
    ];
    return (
      <TouchableOpacity onPress={() => setVersionSelected(item.v)} style={btnStyle}>
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
          <Icon style={styles.tagIcon} iconType="AntDesign" name="tag" />
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
            <Icon style={styles.tagIcon} iconType="AntDesign" name="tag" />
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
        rightIconStyle={diffIconStyle}
        handleRightIconPress={() => setShowDiff(!showDiff)}
      />
      {isLoading ? (
        <PostPlaceHolder />
      ) : (
        <View style={styles.mainContainer}>
          {editHistory.length > 0 && _renderVersionsList()}
          {editHistory.length > 0 && _renderBody()}
        </View>
      )}
    </Fragment>
  );
};

export default gestureHandlerRootHOC(EditHistoryScreen);
