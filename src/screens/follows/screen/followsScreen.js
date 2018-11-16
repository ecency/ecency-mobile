import React, { Component } from 'react';
import { View, Text, FlatList } from 'react-native';
// Constants

// Components
import { EditorHeader } from '../../../components/editorHeader';
import { UserListItem } from '../../../components/basicUIElements';

// Utils
import { isBefore } from '../../../utils/time';
import styles from './followScreenStyles';

class FollowsScreen extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */

  constructor(props) {
    super(props);
    this.state = {
      data: props.data,
      filterResult: null,
    };
  }

  // Component Life Cycles

  // Component Functions
  _handleOnDropdownSelect = (index) => {
    const { data } = this.state;
    const _data = data;

    switch (index) {
      case '0':
        _data.sort((a, b) => Number(b.value) - Number(a.value));
        break;
      case '1':
        _data.sort((a, b) => b.percent - a.percent);
        break;
      case '2':
        _data.sort((a, b) => (isBefore(a.time, b.time) ? 1 : -1));
        break;
      default:
        break;
    }

    this.setState({ filterResult: _data });
  };

  _handleRightIconPress = () => {};

  _handleSearch = (text) => {
    const { data } = this.state;

    const newData = data.filter((item) => {
      const itemName = item.username.toUpperCase();
      const _text = text.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    this.setState({ filterResult: newData });
  };

  _renderItem = (item, index) => {
    const { handleOnUserPress } = this.props;
    const reputation = `(${item.reputation})`;
    const value = `$ ${item.value}`;
    const percent = `${item.percent}%`;
    const avatar = `https://steemitimages.com/u/${item.follower}/avatar/small`;
    return (
      <UserListItem
        handleOnUserPress={handleOnUserPress}
        avatar={avatar}
        index={index}
        username={item.follower}
        reputation={reputation}
        description={item.created}
        isHasRightItem
        isRightColor={item.is_down_vote}
        rightText={value}
        subRightText={percent}
      />
    );
  };

  render() {
    const { data, filterResult, isFollowers } = this.state;
    const title = isFollowers ? 'Followers' : 'Following';
    const headerTitle = `${title} (${data && data.length})`;

    return (
      <View>
        <EditorHeader
          title={headerTitle}
          rightIconName="ios-search"
          isHasSearch
          handleOnSearch={this._handleSearch}
        />
        {(filterResult && data && filterResult.length > 0) || data.length > 0 ? (
          <FlatList
            data={filterResult || data}
            keyExtractor={item => item.voter}
            removeClippedSubviews={false}
            renderItem={({ item, index }) => this._renderItem(item, index)}
          />
        ) : (
          <Text style={styles.text}>No user found.</Text>
        )}
      </View>
    );
  }
}

export default FollowsScreen;
