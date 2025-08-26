import React from 'react';
import { View, Text } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import ActionSheet from 'react-native-actions-sheet';
import { useIntl } from 'react-intl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import styles from './actionModalStyles';

import { ActionModalPayload, ButtonTypes } from '../container/actionModalContainer';
import { MainButton } from '../../mainButton';

export interface ActionModalRef {
  showModal: () => void;
  closeModal: () => void;
}

interface ActionModalViewProps {
  onClose: () => void;
  data: ActionModalPayload;
}

const ActionModalView = ({ onClose, data }: ActionModalViewProps) => {
  const intl = useIntl();
  const insets = useSafeAreaInsets();

  if (!data) {
    return null;
  }

  const { title, body, buttons, headerImage, para, headerContent, bodyContent } = data;

  const _actionPanelStyle = { ...styles.actionPanel, marginBottom: !insets.bottom && 12 };

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

      <View style={_actionPanelStyle}>
        {buttons ? (
          buttons.map((props) => (
            <MainButton
              key={props.text}
              text={props.textId ? intl.formatMessage({ id: props.textId }) : props.text}
              onPress={(evn) => {
                onClose();
                props.onPress(evn);
              }}
              style={props?.type === ButtonTypes.CANCEL ? styles.cancel : styles.button}
              textStyle={props?.type === ButtonTypes.CANCEL ? styles.cancelBtnText : styles.btnText}
            />
          ))
        ) : (
          <MainButton
            key="default"
            text="OK"
            onPress={() => {
              onClose();
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
      gestureEnabled={false}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.sheetIndicator}
      onClose={onClose}
    >
      {_renderContent}
    </ActionSheet>
  );
};

export default ActionModalView;
