import React, { PureComponent } from 'react';
import {
  View, Text, FlatList, TouchableHighlight,
} from 'react-native';
import FastImage from 'react-native-fast-image';

// Constants

// Components
import { Modal } from '../..';
import SearchInput from '../../searchInput';

// Styles
import styles from './searchModalStyles';

class SearchModalView extends PureComponent {
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
      handleOnChangeSearchInput,
      handleOnClose,
      handleOnPressListItem,
      isOpen,
      placeholder,
      searchResults,
    } = this.props;

    return (
      <Modal
        isOpen={isOpen}
        handleOnModalClose={() => handleOnClose()}
        isFullScreen
        swipeToClose
        isTransparent
      >
        <View style={styles.container}>
          <SearchInput
            onChangeText={handleOnChangeSearchInput}
            handleOnModalClose={handleOnClose}
            placeholder={placeholder}
          />
          <View style={styles.body}>
            <FlatList
              data={searchResults.data}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableHighlight onPress={() => handleOnPressListItem(searchResults.type, item)}>
                  <View style={styles.searhItems}>
                    <View style={{ flex: 1 }}>
                      {item.image && (
                        <FastImage
                          source={{
                            uri: item.image,
                          }}
                          style={styles.searchItemImage}
                        />
                      )}
                    </View>
                    <View style={{ flex: 7 }}>
                      {item.text && <Text style={styles.searchItemText}>{item.text}</Text>}
                    </View>
                  </View>
                </TouchableHighlight>
              )}
              keyExtractor={(post, index) => index.toString()}
              removeClippedSubviews
              onEndThreshold={0}
              initialNumToRender={20}
            />
          </View>
        </View>
      </Modal>
    );
  }
}

export default SearchModalView;
