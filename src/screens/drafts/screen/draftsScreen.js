import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import { View, FlatList, Text } from 'react-native';

// Utils
import { getPostSummary } from '../../../utils/formatter';

// Constants

// Components
import { BasicHeader } from '../../../components/basicHeader';
import { PostListItem } from '../../../components/postListItem';
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
    // const img = catchEntryImage(item) || noImage;
    const summary = getPostSummary(item.body, 100);

    return (
      <PostListItem
        created={item.created}
        mainTag={tag}
        title={item.title}
        summary={summary}
        username={currentAccount.name}
        reputation={currentAccount.reputation}
        handleOnPressItem={editDraft}
        handleOnRemoveItem={removeDraft}
      />
    );
  };

  render() {
    const { drafts, isLoading, intl } = this.props;

    return (
      <View style={globalStyles.lightContainer}>
        <BasicHeader
          title={intl.formatMessage({
            id: 'drafts.title',
          })}
        />
        {isLoading ? (
          <Text>Loading daa!</Text>
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
