import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { TextInput } from '..';
import { ThemeContainer } from '../../containers';
import Modal from '../modal';
import styles from './snippetEditorModalStyles';


export interface SnippetEditorModalRef {
    showNewModal:()=>void;
    showEditModal:(snippetId:number, title:string, body:string)=>void;
}

interface SnippetEditorModalProps {

}

const SnippetEditorModal = (props: SnippetEditorModalProps, ref) => {
    const titleInputRef = useRef(null);
    const bodyInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [isNewSnippet, setIsNewSnippet] = useState(true);
    const [showModal, setShowModal] = useState(false);   
    const [titleHeight, setTitleHeight] = useState(0)

    useImperativeHandle(ref, () => ({
        showNewModal: () => {
          setTitle('');
          setBody('');
          setIsNewSnippet(true);
          setShowModal(true);
        },
        showEditModal:()=>{

        }
      }));

      
    //save snippet based on editor type
    const _saveSnippet = () => {
        if(!isNewSnippet){
            Alert.alert("Updating snippet:")
        }else{
            Alert.alert("Saving snippet")
        }
    }


    const _renderContent = (
        <ThemeContainer>
            {(isDarkTheme)=>(
            <View style={styles.container}>
                <View style={{height:Math.max(35, titleHeight)}}>
                    <TextInput
                        innerRef={titleInputRef}
                        style={styles.titleInput}
                        height={Math.max(35, titleHeight)}
                        placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
                        maxLength={250}
                        placeholder={"Snippet Title"}
                        multiline
                        numberOfLines={2}
                        onContentSizeChange={(event) => {
                        setTitleHeight(event.nativeEvent.contentSize.height);
                        }}
                        onChangeText={setTitle}
                        value={title}
                    />
                </View>
              
                <TextInput
                    multiline
                    autoCorrect={true}
                    value={body}
                    onChangeText={setBody}
                    placeholder={"Add snippet body here...."}
                    placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
                    selectionColor="#357ce6"
                    style={styles.bodyWrapper}
                    underlineColorAndroid="transparent"
                    innerRef={bodyInputRef}
                    autoGrow={false}
                    scrollEnabled={false}
                    height={100}
                />
                <Button 
                    title={"SAVE"}
                    onPress={_saveSnippet}
                />
            </View>
            )}
            </ThemeContainer>
        )

  return (
      <Modal 
        isOpen={showModal}
        handleOnModalClose={()=>{setShowModal(false)}}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={isNewSnippet?"Add Snippet":"Edit Snippet"}
        animationType="slide"
        style={styles.beneficiaryModal}
      >
        {_renderContent}
      </Modal>
     
  );
};

export default forwardRef(SnippetEditorModal);


