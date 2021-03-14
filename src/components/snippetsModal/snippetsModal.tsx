import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { getSnippets, removeSnippet } from '../../providers/ecency/ecency';
import { MainButton } from '..';
import styles from './snippetsModalStyles';
import { RefreshControl } from 'react-native';
import SnippetEditorModal, { SnippetEditorModalRef } from '../snippetEditorModal/snippetEditorModal';
import SnippetItem from './snippetItem';
import { Snippet } from '../../models';

interface SnippetsModalProps {
  username:string,
  handleOnSelect:(snippetText:string)=>void,
}

const SnippetsModal = ({ username, handleOnSelect }:SnippetsModalProps) => {
  const editorRef = useRef<SnippetEditorModalRef>(null);
  const intl = useIntl();
  console.log('username', username);
  const [snippets, setSnippets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log(username);
    _getSnippets();
  }, []);



  //fetch snippets from server
  const _getSnippets = async () => {
    try{
      if (username) {
        setIsLoading(true);
        const snips = await getSnippets(username)
        console.log("snips received", snips)
        setSnippets(snips);
        setIsLoading(false);
      }
    }catch(err){
      console.warn("Failed to get snippets")
      setIsLoading(false);
    }
  }

  //removes snippet from users snippet collection
  const _removeSnippet = async (id:string) => {
    try{
      if (username) {
        setIsLoading(true);
        const snips = await removeSnippet(username, id)
        setSnippets(snips);
        setIsLoading(false);
      }
    }catch(err){
      console.warn("Failed to get snippets")
      setIsLoading(false);
    }
  }



  //render list item for snippet and handle actions;
  const _renderItem = ({ item, index }:{item:Snippet, index:number}) => {

    const _onPress = () => handleOnSelect(item.body)

    const _onRemovePress = () => {
      _removeSnippet(item.id);
    }

    const _onEditPress = () => {
      if(editorRef.current){
        editorRef.current.showEditModal(item);
      }
    }

    return (
      <TouchableOpacity onPress={_onPress}>
        <SnippetItem 
            title={item.title} 
            body={item.body} 
            index={index}
            onEditPress={_onEditPress}
            onRemovePress={_onRemovePress}
          />
      </TouchableOpacity>
    )
  };



  //render empty list placeholder
  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.title}>No snippets found</Text>
      </>
    );
  };




  //renders footer with add snipept button and shows new snippet modal
  const _renderListFooter = () => {
    const _onPress = () => {
      if(editorRef.current){
        editorRef.current.showNewModal();
      }
    }
    return (
      <>
        <MainButton
          style={{ width: 150, marginTop:16, }}
          onPress={_onPress}
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
          renderItem={_renderItem}
          ListEmptyComponent={_renderEmptyContent}
          ListFooterComponent={_renderListFooter}
          refreshControl={
            <RefreshControl 
              refreshing={isLoading}
              onRefresh={_getSnippets}
            />
          }
        />
      </View>

      <SnippetEditorModal 
          ref={editorRef}
          username={username}
          onSnippetsUpdated={setSnippets}
      />
    </View>
  );
};

export default SnippetsModal;
