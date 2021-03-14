import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, TouchableOpacity, Alert } from 'react-native';
import { useIntl } from 'react-intl';
import { getSnippets } from '../../providers/ecency/ecency';
import { MainButton } from '..';
import styles from './snippetsModalStyles';
import { RefreshControl } from 'react-native';
import SnippetEditorModal, { SnippetEditorModalRef } from '../snippetEditorModal/snippetEditorModal';
import SnippetItem from './snippetItem';

interface Snippet {
  id:number;
  title:string;
  body:string;
}

const SnippetsModal = ({ username, handleOnSelect }) => {
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

    const _onPress = () => handleOnSelect({ text: item.body, selection: { start: 0, end: 0 } })

    const _onEditPress = () => {
      if(editorRef.current){
        editorRef.current.showEditModal(item.id, item.title, item.body);
      }
    }

    return (
      <TouchableOpacity onPress={_onPress}>
        <SnippetItem 
            title={item.title} 
            body={item.body} 
            index={index}
            onEditPress={_onEditPress}
          />
      </TouchableOpacity>
    )
  };



  //render empty list placeholder
  const _renderEmptyContent = () => {
    return (
      <>
        <Text style={styles.title}>Nothing here</Text>
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
          style={{ width: 150 }}
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
      />
    </View>
  );
};

export default SnippetsModal;
