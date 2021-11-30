import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { useIntl } from 'react-intl';
import { View } from 'react-native';
import { Modal, SettingsItem } from '../../../components';
import styles from './editorSettingsModalStyles';


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
  handleRewardChange:(rewardType:string)=>void
}

const EditorSettingsModal =  forwardRef(({
  handleRewardChange
}: EditorSettingsModalProps, ref) => {
    const intl = useIntl();
    const [showModal, setShowModal] = useState(false);
    const [rewardTypeIndex, setRewardTypeIndex] = useState(0); 
  

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


