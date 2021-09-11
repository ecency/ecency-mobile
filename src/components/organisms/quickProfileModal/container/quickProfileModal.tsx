import React, { useEffect, useRef } from 'react';
import { AlertButton } from 'react-native';
import { Source } from 'react-native-fast-image';
import ActionSheet from 'react-native-actions-sheet';
import { QuickProfileContent } from '../children/quickProfileContent';
import EStyleSheet from 'react-native-extended-stylesheet';
import styles from '../children/quickProfileStyles';
import { useAppDispatch, useAppSelector } from '../../../../hooks';
import { hideProfileModal } from '../../../../redux/actions/uiAction';



export interface ActionModalData {
  title:string, 
  body:string, 
  buttons:AlertButton[], 
  headerImage?:Source,
  onClosed:()=>void,
}


export const QuickProfileModal = ({}) => {
    const sheetModalRef = useRef<ActionSheet>();
    const dispatch = useAppDispatch();

    const profileModalUsername = useAppSelector((state)=>state.ui.profileModalUsername);
    const currentAccount = useAppSelector((state)=>state.account.currentAccount);


    useEffect(() => {
        if(profileModalUsername){
            sheetModalRef.current.show();
        }
    }, [profileModalUsername])


    const _onClose = () => {
        dispatch(hideProfileModal());
    }
    

    return (
        <ActionSheet 
            ref={sheetModalRef}
            gestureEnabled={true}
            containerStyle={styles.sheetContent}
            onClose={_onClose}
            indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}> 
            
            <QuickProfileContent
                username={profileModalUsername}
                currentAccountName={currentAccount.name}
            />
        </ActionSheet> 
    );
};
