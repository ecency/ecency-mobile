import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';

// Utils
import { getPostSummary } from '../../../utils/formatter';
import { catchDraftImage } from '../../../utils/image';
// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostListItem } from '../../../components/postListItem';
import { PostCardPlaceHolder } from '../../../components/basicUIElements';

// Styles
import globalStyles from '../../../globalStyles';

class DraftsScreen extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _renderItem = (item, index) => {
    const { currentAccount, removeDraft, editDraft } = this.props;
    const tags = item.tags ? item.tags.split(/[ ,]+/) : [];
    const tag = tags[0] || '';
    const image = catchDraftImage(item.body);
    const summary = getPostSummary(item.body, 100);

    return (
      <PostListItem
        created={item.created}
        mainTag={tag}
        title={item.title}
        summary={summary}
        image={image ? { uri: catchDraftImage(item.body) } : null}
        username={currentAccount.name}
        reputation={currentAccount.reputation}
        handleOnPressItem={editDraft}
        handleOnRemoveItem={removeDraft}
        id={item._id}
      />
    );
  };

  render() {
    const { drafts, isLoading, intl } = this.props;
    const isNoDrafts = drafts && drafts.length === 0;

    return (
      <View style={isNoDrafts ? globalStyles.container : globalStyles.lightContainer}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'drafts.title',
          })}
        />
        {isNoDrafts && (
          <Text style={globalStyles.hintText}>
            {intl.formatMessage({
              id: 'drafts.empty_list',
            })}
          </Text>
        )}
        {isLoading ? (
          <View>
            <PostCardPlaceHolder />
            <PostCardPlaceHolder />
          </View>
        ) : (
          <FlatList
            data={drafts}
            keyExtractor={item => item._id}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => this._renderItem(item, index)}
          />
        )}
      </View>
    );
  }
}

export default injectIntl(DraftsScreen);
