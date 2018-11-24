import React, { Component } from 'react';
import {
  View, FlatList, Image, Text, TouchableHighlight,
} from 'react-native';

// Constants

// Components
import { InputWithIcon } from '../..';

// Styles
// eslint-disable-next-line
import styles from './searchStyles';

class SearchView extends Component {
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

  render() {
    const {
      handleCloseButton,
      handleOnChangeSearchInput,
      handleOnPressListItem,
      searchResults,
    } = this.props;
    return (
      <View style={styles.container}>
        <InputWithIcon
          rightIconName="md-close-circle"
          leftIconName="md-search"
          handleOnPressRightIcon={handleCloseButton}
          onChange={value => handleOnChangeSearchInput(value)}
          placeholder="Search..."
          isEditable
          type="username"
          isFirstImage
        />
        <FlatList
          data={searchResults.data}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            //  TODO: Create a component to list search results
            <TouchableHighlight onPress={() => handleOnPressListItem(searchResults.type, item)}>
              <View style={styles.searhItems}>
                <Image
                  source={{
                    uri:
                      searchResults.type === 'user'
                        ? `https://steemitimages.com/u/${item.author}/avatar/small`
                        : item.img_url || `https://steemitimages.com/u/${item.author}/avatar/small`,
                  }}
                  style={styles.searchItemImage}
                />
                <Text style={styles.searchItemText}>
                  {searchResults.type === 'user' ? item.author : item.title}
                </Text>
              </View>
            </TouchableHighlight>
          )}
          keyExtractor={(post, index) => index.toString()}
          removeClippedSubviews
          onEndThreshold={0}
          initialNumToRender={20}
        />
      </View>
    );
  }
}

export default SearchView;
