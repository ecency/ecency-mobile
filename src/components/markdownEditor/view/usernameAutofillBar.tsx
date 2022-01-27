import React, {useState, useEffect} from 'react';
import { View, FlatList, Text, TouchableOpacity } from "react-native"
import { UserAvatar } from '../..';
import { searchAccount } from '../../../providers/ecency/ecency';
import { extractWordAtIndex } from '../../../utils/editor';
import styles from './markdownEditorStyles';

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

    useEffect(() => {
        if (selection.start === selection.end && text) {
            const word = extractWordAtIndex(text, selection.start);
            console.log('selection word is: ', word);
            if (word.startsWith('@') && word.length > 3) {
              _handleUserSearch(word.substring(1));
            } else {
              setSearchedUsers([]);
            }
          }
    }, [text, selection])


    const _handleUserSearch = async (username) => {
        let users = [];
        if (username) {
          users = await searchAccount(username, 5);
          console.log('result users', users);
        }
        setSearchedUsers(users);
      };
    
      const _onUserSelect = (username) => {
        onApplyUsername(username)
        setSearchedUsers([]);
      };

    if(!searchedUsers || searchedUsers.length === 0){
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

    const usernames = searchedUsers.map(user=>user.name)

    return (
        <View style={styles.searchAccountsContainer}> 
            <FlatList 
                horizontal={true}
                data={usernames}
                keyboardShouldPersistTaps="always"
                showsHorizontalScrollIndicator={false}
                renderItem={_renderItem}
                />
        </View>
    )
  }
