import React, { Component } from 'react';
import {
  View, FlatList, Image, Text,
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
    const { handleCloseButton, handleOnChangeSearchInput, searchResults } = this.props;
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
          data={searchResults}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            //  TODO: Create a component to list search results
            <View
              style={{
                marginHorizontal: 10,
                marginVertical: 10,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                }}
              >
                <Image
                  source={{
                    uri: `https://steemitimages.com/u/${item.author}/avatar/small`,
                  }}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'gray',
                  }}
                />
                <Text style={{ color: 'white' }}>{`${item.author}`}</Text>
              </View>
            </View>
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
