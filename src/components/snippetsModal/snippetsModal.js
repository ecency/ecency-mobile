import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { useIntl } from 'react-intl';

import { getSnippets } from '../../providers/ecency/ecency';

import { MainButton } from '..';

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
      <Text style={styles.title}>{`${item.title}`}</Text>
      <Text style={styles.body} numberOfLines={2} ellipsizeMode="tail">{`${item.body}`}</Text>
    </View>
  );

  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.title}>Nothing here</Text>
      </>
    );
  };

  const _renderListFooter = () => {
    return (
      <>
        <MainButton
          style={{ width: 150 }}
          onPress={() => Alert.alert('create new snippet')}
          iconName="plus"
          iconType="MaterialCommunityIcons"
          iconColor="white"
          text="Snippet"
        />
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
          ListFooterComponent={_renderListFooter}
        />
      </View>
    </View>
  );
};

export default SnippetsModal;
