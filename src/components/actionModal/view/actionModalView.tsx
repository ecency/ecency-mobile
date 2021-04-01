import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {View, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import { TextButton } from '../../buttons';
import styles from './actionModalStyles';

import { ActionModalData } from '../container/actionModalContainer';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actions-sheet';
import { Modal } from '../..';


export interface ActionModalRef {
    showModal:()=>void;
    closeModal:()=>void;
}

interface ActionModalViewProps {
    onClose:()=>void;
    data:ActionModalData;
}

const ActionModalView = ({onClose, data}: ActionModalViewProps, ref) => {

    const sheetModalRef = useRef<ActionSheet>();

    const [showModal, setShowModal] = useState(false);

    useImperativeHandle(ref, () => ({
        showModal: () => {
            setShowModal(true);
            // sheetModalRef.current?.setModalVisible(true);
        },
        closeModal() {
            setShowModal(false);
            // sheetModalRef.current?.setModalVisible(false);
        },
    }));

    if(!data){
        return null;
    }

    const {
        title,
        body,
        buttons, 
        headerImage
    } = data;


    const _renderContent = (
        <View style={styles.container}>

            <View style={styles.contentContainer}>
                
                {
                    headerImage && (
                        <FastImage 
                            source={headerImage}
                            style={styles.imageStyle}
                            resizeMode='contain'
                        />
                    )
                }
                <Text>{title}</Text>
                <Text>{body}</Text>
            </View>

            
            <View style={styles.actionPanel}>
                {
                    buttons.map((props)=>(
                        <TextButton 
                            text={props.text}
                            onPress={(evn)=>{
                                // sheetModalRef.current?.setModalVisible(false);
                                setShowModal(false);
                                onClose();
                                props.onPress(evn);
                            }}
                            style={styles.button}
                            textStyle={styles.btnText}
                        />
                    ))
                }
            </View>
            
        </View>
    )

  return (
      <Modal 
        isOpen={showModal}
        handleOnModalClose={()=>{
            onClose();
            setShowModal(false)
        }}
        presentationStyle="formSheet"
        title={title}
        animationType="slide"
        style={styles.modalStyle}
        coverScreen={false}
      >
    {/* // <View style={{backgroundColor: 'yellow'}}> */}
    {/* //     <ActionSheet  */}
    {/* //       ref={sheetModalRef}
    //       gestureEnabled={true}
    //       hideUnderlay
    //       containerStyle={styles.sheetContent}
    //       indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
    //       onClose={onClose}
    //         > */}
        {_renderContent}
    {/* // </ActionSheet> */}
    {/* // </View> */}
    
     
      </Modal>
     
  );
};

export default forwardRef(ActionModalView);



