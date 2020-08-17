import React, { PureComponent } from 'react';
import { View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import FastImage from 'react-native-fast-image';
import { get, has } from 'lodash';

// Components
import { Modal, SearchInput } from '../..';

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
  _renderItem = ({ item }) => {
    const { handleOnPressListItem, searchResults } = this.props;

    return (
      // TODO: Make it quick ui component
      <TouchableOpacity onPress={() => handleOnPressListItem(get(searchResults, 'type'), item)}>
        <View style={styles.searchItems}>
          <View style={styles.searchItemImageWrapper}>
            {item.image && (
              <FastImage
                source={{
                  uri: item.image,
                }}
                style={styles.searchItemImage}
              />
            )}
          </View>
          <View style={styles.searchItemTextWrapper}>
            {has(item, 'text') && <Text style={styles.searchItemText}>{item.text}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        handleOnModalClose={handleOnClose}
        isFullScreen
        swipeToClose
        isTransparent
      >
        <SafeAreaView style={styles.container}>
          <SearchInput
            onChangeText={handleOnChangeSearchInput}
            handleOnModalClose={handleOnClose}
            placeholder={placeholder}
          />
          <View style={styles.body}>
            {get(searchResults, 'data', []).length < 1 && (
              <View style={styles.searchItems}>
                <View style={styles.searchItemTextWrapper}>
                  <Text style={styles.searchItemTextGap}>
                    Start typing to find what you are looking for...
                  </Text>
                  <Text style={styles.searchItemTextGap}>@usernames</Text>
                  <Text style={styles.searchItemTextGap}>#tags</Text>
                  <Text style={styles.searchItemTextGap}>anything else</Text>
                </View>
              </View>
            )}
            <FlatList
              data={get(searchResults, 'data', [])}
              showsVerticalScrollIndicator={false}
              renderItem={this._renderItem}
              keyExtractor={(item, index) => get(item, 'id', index).toString()}
              removeClippedSubviews
              onEndThreshold={0}
              initialNumToRender={20}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }
}

export default SearchModalView;
