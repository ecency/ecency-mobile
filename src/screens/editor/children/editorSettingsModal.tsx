import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import {Text, View} from 'react-native';
import { Modal } from '../../../components';
import styles from './editorSettingsModalStyles';


export interface EditorSettingsModalRef {
    showModal:()=>void;
}


interface EditorSettingsModalProps {
}

const EditorSettingsModal =  forwardRef(({}: EditorSettingsModalProps, ref) => {
    const intl = useIntl();
    const [showModal, setShowModal] = useState(false);   
  

    useImperativeHandle(ref, () => ({
        show: () => {
          setShowModal(true);
        },
      }));
      

    const _renderContent = (
        <View style={styles.container}>
            <Text>This is a modal</Text>
        </View>
    )


  return (
    <Modal 
        isOpen={showModal}
        handleOnModalClose={() => setShowModal(false)}
        isFullScreen
        isCloseButton
        presentationStyle="formSheet"
        title={"Editor Settings"}
        animationType="slide"
        style={styles.modalStyle}
    >
    {_renderContent}
    </Modal>
     
  );
});

export default EditorSettingsModal


