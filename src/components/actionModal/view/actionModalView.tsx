import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text } from 'react-native';
import FastImage from 'react-native-fast-image';
import EStyleSheet from 'react-native-extended-stylesheet';
import ActionSheet from 'react-native-actions-sheet';
import styles from './actionModalStyles';

import { ActionModalData } from '../container/actionModalContainer';
import { MainButton } from '../../mainButton';
import { useIntl } from 'react-intl';

export interface ActionModalRef {
  showModal: () => void;
  closeModal: () => void;
}

interface ActionModalViewProps {
  onClose: () => void;
  data: ActionModalData;
}

const ActionModalView = ({ onClose, data }: ActionModalViewProps, ref) => {
  const sheetModalRef = useRef<ActionSheet>();

  const intl = useIntl();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      console.log('Showing action modal');
      sheetModalRef.current?.setModalVisible(true);
    },
    closeModal() {
      sheetModalRef.current?.setModalVisible(false);
    },
  }));

  if (!data) {
    return null;
  }

  const { title, body, buttons, headerImage, para, headerContent } = data;

  const _renderContent = (
    <View style={styles.container}>
      {headerContent && headerContent}
      {headerImage && (
        <FastImage source={headerImage} style={styles.imageStyle} resizeMode="contain" />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {!!body && (
          <>
            <Text style={styles.bodyText}>{body}</Text>
            <Text style={styles.bodyText}>{para}</Text>
          </>
        )}
      </View>

      <View style={styles.actionPanel}>
        {buttons ? (
          buttons.map((props) => (
            <MainButton
              key={props.text}
              text={props.textId ? intl.formatMessage({id:props.textId}) : props.text}
              onPress={(evn) => {
                sheetModalRef.current?.setModalVisible(false);
                props.onPress(evn);
              }}
              style={styles.button}
              textStyle={styles.btnText}
            />
          ))
        ) : (
          <MainButton
            key="default"
            text="OK"
            onPress={() => {
              sheetModalRef.current?.setModalVisible(false);
            }}
            style={styles.button}
            textStyle={styles.btnText}
          />
        )}
      </View>
    </View>
  );

  return (
    <ActionSheet
      ref={sheetModalRef}
      gestureEnabled={false}
      hideUnderlay
      containerStyle={styles.sheetContent}
      indicatorColor={EStyleSheet.value('$primaryWhiteLightBackground')}
      onClose={onClose}
    >
      {_renderContent}
    </ActionSheet>
  );
};

export default forwardRef(ActionModalView);
