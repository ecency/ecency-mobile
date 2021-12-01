import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, View } from 'react-native';
import { Modal, SettingsItem } from '../../../components';
import styles from './editorSettingsModalStyles';
import ThumbSelectionContent from './thumbSelectionContent';


const REWARD_TYPES = [
  {
    key:'default',
    intlId:'editor.reward_default'
  },
  {
    key:'sp',
    intlId:'editor.reward_power_up'
  },
  {
    key:'dp',
    intlId:'editor.reward_decline'
  },
]



export interface EditorSettingsModalRef {
    showModal:()=>void;
}


interface EditorSettingsModalProps {
  body:string;
  handleRewardChange:(rewardType:string)=>void;
  handleThumbSelection:(index:number)=>void;
}

const EditorSettingsModal =  forwardRef(({
  body,
  handleRewardChange,
  handleThumbSelection,
}: EditorSettingsModalProps, ref) => {
    const intl = useIntl();

    const [showModal, setShowModal] = useState(false);
    const [rewardTypeIndex, setRewardTypeIndex] = useState(0);
    const [thumbIndex, setThumbIndex] = useState(0);

    useEffect(() => {
      if(handleThumbSelection){
        handleThumbSelection(thumbIndex);
      }
    }, [thumbIndex])
  

    useImperativeHandle(ref, () => ({
        show: () => {
          setShowModal(true);
        },
      }));


    const _handleRewardChange = (index:number) => {
      setRewardTypeIndex(index)
      const rewardTypeKey = REWARD_TYPES[index].key
      if (handleRewardChange) {
        handleRewardChange(rewardTypeKey);
      }
    } 
 

    const _renderContent = (
        <View style={styles.container}>
          <SettingsItem
            title={intl.formatMessage({
              id: 'editor.setting_reward',
            })}
            type="dropdown"
            actionType="reward"
            options={
              REWARD_TYPES.map((type)=>intl.formatMessage({ id: type.intlId}))
            }
            selectedOptionIndex={rewardTypeIndex}
            handleOnChange={_handleRewardChange}
          />

          <ThumbSelectionContent 
            body={body}
            thumbIndex={thumbIndex}
            onThumbSelection={setThumbIndex}
          />
          
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


