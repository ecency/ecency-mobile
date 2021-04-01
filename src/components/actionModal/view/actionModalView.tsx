import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import {View, Text} from 'react-native';
import FastImage from 'react-native-fast-image';
import { TextButton } from '../../buttons';
import styles from './actionModalStyles';

import { ActionModalData } from '../container/actionModalContainer';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actions-sheet';


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

    useImperativeHandle(ref, () => ({
        showModal: () => {
            console.log("Showing action modal")
            sheetModalRef.current?.setModalVisible(true);
        },
        closeModal() {
       
            sheetModalRef.current?.setModalVisible(false);
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
                            key={props.text}
                            text={props.text}
                            onPress={(evn)=>{
                                sheetModalRef.current?.setModalVisible(false);
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

    <View > 
         <ActionSheet 
           ref={sheetModalRef}
            gestureEnabled={true}
            hideUnderlay
            containerStyle={styles.sheetContent}
            indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
            onClose={onClose}> 
            {_renderContent}
        </ActionSheet> 
     </View> 

  );
};

export default forwardRef(ActionModalView);



