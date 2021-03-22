import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { Alert, KeyboardAvoidingView, Platform, View } from 'react-native';
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
    const intl = useIntl();
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
                Alert.alert(intl.formatMessage({id:'snippets.message_incomplete'}));
                return;
            }

            let response = [];
            if(!isNewSnippet){
                console.log("Updating snippet:", username, snippetId, title, body)
                response = await updateSnippet(username, snippetId, title, body)
                console.log("Response from add snippet: ", response)
            }else{
                console.log("Saving snippet:", username, title, body)
                const res = await addSnippet(username, title, body)
                response = res && res.fragments
                console.log("Response from add snippet: ", response)
            }
            setShowModal(false);
            onSnippetsUpdated(response);

        }catch(err){
            Alert.alert(intl.formatMessage({id:'snippets.message_failed'}))
            console.warn("Failed to save snippet", err)
        }
       
    }


    const _renderContent = (
        <ThemeContainer>
            {({isDarkTheme})=>(
                 <KeyboardAvoidingView
                    style={styles.container}
                    keyboardVerticalOffset={Platform.OS == 'ios' ? 64 : null}
                    behavior={Platform.OS === 'ios' ? 'padding' : null}
                >
                    <View style={styles.inputContainer}>

                    
                        <View style={{height:Math.max(35, titleHeight)}}>
                            <TextInput
                                autoFocus={true}
                                innerRef={titleInputRef}
                                style={styles.titleInput}
                                height={Math.max(35, titleHeight)}
                                placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
                                maxLength={250}
                                placeholder={intl.formatMessage({id:'snippets.placeholder_title'})}
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
                            placeholder={intl.formatMessage({id:'snippets.placeholder_body'})}
                            placeholderTextColor={isDarkTheme ? '#526d91' : '#c1c5c7'}
                            selectionColor="#357ce6"
                            style={styles.bodyWrapper}
                            underlineColorAndroid="transparent"
                            innerRef={bodyInputRef}
                            autoGrow={false}
                            scrollEnabled={false}
                            height={100}
                        />
                    </View>

                   
                        <View style={styles.actionPanel}>
                            <TextButton 
                                text={intl.formatMessage({id:'snippets.btn_close'})}
                                onPress={()=>setShowModal(false)}
                                style={styles.closeButton}
                            />
                            <TextButton 
                                text={intl.formatMessage({id:'snippets.btn_save'})}
                                onPress={_saveSnippet}
                                textStyle={styles.btnText}
                                style={styles.saveButton}
                            />
                        </View>
                    
                </KeyboardAvoidingView>
            )}
            </ThemeContainer>
        )

  return (
      <Modal 
        isOpen={showModal}
        handleOnModalClose={()=>{setShowModal(false)}}
        presentationStyle="formSheet"
        title={intl.formatMessage({
            id:isNewSnippet
                ? 'snippets.title_add_snippet'
                : 'snippets.title_edit_snippet'
        })}
        animationType="slide"
        style={styles.modalStyle}
      >
        {_renderContent}
      </Modal>
     
  );
};

export default forwardRef(SnippetEditorModal);


