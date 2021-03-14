import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { TextInput } from '..';
import { ThemeContainer } from '../../containers';
import { Snippet } from '../../models';
import { addSnippet, updateSnippet } from '../../providers/ecency/ecency';
import { TextButton } from '../buttons';
import Modal from '../modal';
import styles from './snippetEditorModalStyles';


export interface SnippetEditorModalRef {
    showNewModal:()=>void;
    showEditModal:(snippet:Snippet)=>void;
}

interface SnippetEditorModalProps {
    username:string;
    onSnippetsUpdated:(snips:Array<Snippet>)=>void;
}

const SnippetEditorModal = ({username, onSnippetsUpdated}: SnippetEditorModalProps, ref) => {
    const titleInputRef = useRef(null);
    const bodyInputRef = useRef(null);

    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [snippetId, setSnippetId] = useState<string|null>(null);
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
        showEditModal:(snippet:Snippet)=>{
            setSnippetId(snippet.id);
            setTitle(snippet.title);
            setBody(snippet.body);
            setIsNewSnippet(false);
            setShowModal(true);
        }
      }));


    //save snippet based on editor type
    const _saveSnippet = async () => {
        try{
            if(!title || !body){
                Alert.alert("Please add both title and body for snippet");
                return;
            }

            let response = [];
            if(!isNewSnippet){
                console.log("Updating snippet:", username, snippetId, title, body)
                response = await updateSnippet(username, snippetId, title, body)
                console.log("Response from add snippet: ", response)
            }else{
                console.log("Saving snippet:", username, title, body)
                response = await addSnippet(username, title, body)
                console.log("Response from add snippet: ", response)
            }
            setShowModal(false);
            onSnippetsUpdated(response);

        }catch(err){
            Alert.alert("Failed to save snippet")
            console.warn("Failed to save snippet", err)
        }
       
    }


    const _renderContent = (
        <ThemeContainer>
            {({isDarkTheme})=>(
                <View style={styles.container}>
                    <View style={{height:Math.max(35, titleHeight)}}>
                        <TextInput
                            autoFocus={true}
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

                    <View style={{flexDirection:'row', justifyContent:'flex-end', alignItems:'center'}}>
                    
                        <TextButton 
                            text={"CLOSE"}
                            onPress={()=>setShowModal(false)}
                            style={styles.closeButton}
                        />
                        <TextButton 
                            text={"SAVE"}
                            onPress={_saveSnippet}
                            textStyle={styles.btnText}
                            style={styles.saveButton}
                        />
                    </View>
                
                </View>
            )}
            </ThemeContainer>
        )

  return (
      <Modal 
        isOpen={showModal}
        handleOnModalClose={()=>{setShowModal(false)}}
        presentationStyle="formSheet"
        title={isNewSnippet?"Add Snippet":"Edit Snippet"}
        animationType="slide"
        style={styles.modalStyle}
      >
        {_renderContent}
      </Modal>
     
  );
};

export default forwardRef(SnippetEditorModal);


