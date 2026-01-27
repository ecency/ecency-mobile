import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { debounce } from 'lodash';
import { lookupAccountsQueryOptions } from '@ecency/sdk';
import { useQueryClient } from '@tanstack/react-query';
import { UserAvatar } from '../..';
import { extractWordAtIndex } from '../../../utils/editor';
import styles from '../styles/markdownEditorStyles';

interface Props {
  text: string;
  selection: {
    start: number;
    end: number;
  };
  onApplyUsername: (username: string) => void;
}

export const UsernameAutofillBar = ({ text, selection, onApplyUsername }: Props) => {
  const queryClient = useQueryClient();
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (selection.start === selection.end && text) {
      _processTextForSearch(text, selection.start);
    }
  }, [text, selection]);

  const _processTextForSearch = useCallback(
    debounce(
      (text: string, index: number) => {
        const word = extractWordAtIndex(text, index);
        console.log('selection word is: ', word);
        if (word.startsWith('@') && word.length > 1) {
          _handleUserSearch(word.substring(1));
        } else {
          setSearchedUsers([]);
          setQuery('');
          _handleUserSearch.cancel();
        }
      },
      300,
      { leading: true },
    ),
    [],
  );

  const _handleUserSearch = useCallback(
    debounce(
      async (username) => {
        if (query !== username) {
          let users = [];
          if (username) {
            setQuery(username);
            users = await queryClient.fetchQuery(lookupAccountsQueryOptions(username));
            console.log('result users for', username, users);
          }
          setSearchedUsers(users);
        }
      },
      200,
      { leading: true },
    ),
    [queryClient, query],
  );

  const _onUserSelect = (username) => {
    onApplyUsername(username);
    setSearchedUsers([]);
    setQuery('');
  };

  if (!searchedUsers || searchedUsers.length === 0 || query === '') {
    return null;
  }

  const _renderItem = ({ item }: { item: string }) => {
    const username = item;
    return (
      <TouchableOpacity
        onPress={() => {
          _onUserSelect(username);
        }}
      >
        <View style={styles.userBubble}>
          <UserAvatar username={username} />
          <Text style={styles.userBubbleText}>{username}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.searchAccountsContainer}>
      <FlatList
        horizontal={true}
        data={searchedUsers}
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        renderItem={_renderItem}
        keyExtractor={(item) => `searched-user-${item}`}
      />
    </View>
  );
};
