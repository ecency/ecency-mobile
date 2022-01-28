import React, {useState, useEffect} from 'react';
import { View, FlatList, Text, TouchableOpacity } from "react-native"
import { UserAvatar } from '../..';
import { lookupAccounts } from '../../../providers/hive/dhive';
import { extractWordAtIndex } from '../../../utils/editor';
import styles from './markdownEditorStyles';
import {debounce} from 'lodash';

interface Props {
    text:string,
    selection:{
        start:number,
        end:number
    }
    onApplyUsername:(username:string)=>void;
}

export const UsernameAutofillBar = ({text, selection, onApplyUsername}:Props) => {

    const [searchedUsers, setSearchedUsers] = useState([])
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (selection.start === selection.end && text) {
            const word = extractWordAtIndex(text, selection.start);
            console.log('selection word is: ', word);
            if (word.startsWith('@') && word.length > 3) {
              _handleUserSearch(word.substring(1));
            } else {
              setSearchedUsers([]);
              setQuery('')
            }
          }
    }, [text, selection])



    const _handleUserSearch = debounce(async (username) => {
      if(query !== username){
        let users = [];
        if (username) {
          setQuery(username)
          users = await lookupAccounts(username);
          console.log('result users for', username, users);
        }
        setSearchedUsers(users);
      }
        
      }, 200);


    
      const _onUserSelect = (username) => {
        onApplyUsername(username)
        setSearchedUsers([]);
        setQuery('')
      };

    if(!searchedUsers || searchedUsers.length === 0 || query === ''){
        return null;
    }

    const _renderItem = ({item}:{item:string}) => {

        const username = item;
        return (
            <TouchableOpacity onPress={()=>{_onUserSelect(username)}}>
                <View style={styles.userBubble}>
                    <UserAvatar username={username}/>
                    <Text style={styles.userBubbleText}>{username}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <View style={styles.searchAccountsContainer}> 
            <FlatList 
                horizontal={true}
                data={searchedUsers}
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                renderItem={_renderItem}
                keyExtractor={(item)=>`searched-user-${item}`}
                />
        </View>
    )
  }
