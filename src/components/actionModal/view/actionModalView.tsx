import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import ActionSheet from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import styles from './actionModalStyles';

import { ActionModalData } from '../container/actionModalContainer';
import { MainButton } from '../../mainButton';

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
      sheetModalRef.current?.show();
    },
    closeModal() {
      sheetModalRef.current?.hide();
    },
  }));

  if (!data) {
    return null;
  }

  const { title, body, buttons, headerImage, para, headerContent, bodyContent } = data;

  const _renderContent = (
    <View style={styles.container}>
      {headerContent && headerContent}
      {headerImage && (
        <ExpoImage source={headerImage} style={styles.imageStyle} contentFit="contain" />
      )}

      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {bodyContent && bodyContent}
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
              text={props.textId ? intl.formatMessage({ id: props.textId }) : props.text}
              onPress={(evn) => {
                sheetModalRef.current?.hide();
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
              sheetModalRef.current?.hide();
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
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      onClose={onClose}
    >
      {_renderContent}
    </ActionSheet>
  );
};

export default forwardRef(ActionModalView);
