import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';

import { getSnippets } from '../../providers/ecency/ecency';

import { ListPlaceHolder } from '..';

import styles from './snippetsModalStyles';

const SnippetsModal = ({ username, handleOnSelect }) => {
  const intl = useIntl();
  console.log('username', username);
  const [snippets, setSnippets] = useState([]);

  useEffect(() => {
    console.log(username);
    if (username) {
      getSnippets(username).then((r) => {
        setSnippets(r);
      });
    }
  }, []);
  const _renderItem = (item, index) => (
    <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
      <Text style={styles.username}>{`${item.title}`}</Text>
      <Text style={styles.username}>{`${item.body}`}</Text>
    </View>
  );

  const _renderEmptyContent = () => {
    return (
      <>
        <ListPlaceHolder />
      </>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.bodyWrapper}>
        <FlatList
          data={snippets}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() => handleOnSelect({ text: item.body, selection: { start: 0, end: 0 } })}
            >
              {_renderItem(item, index)}
            </TouchableOpacity>
          )}
          ListEmptyComponent={_renderEmptyContent}
        />
      </View>
    </View>
  );
};

export default SnippetsModal;
