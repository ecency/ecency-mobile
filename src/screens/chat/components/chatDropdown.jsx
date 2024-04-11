import React, { useCallback, useMemo, useRef } from 'react';
import { injectIntl } from 'react-intl';
import { useLogoutFromChats } from '@ecency/ns-query';
import ActionSheet from 'react-native-actions-sheet';
import { Text, TouchableOpacity, View } from 'react-native';
import { DropdownButton, Icon, Separator } from '../../../components';
import styles from '../style/chatDropdown.style';
import modalStyles from '../style/chatModal.style';

const ChatDropdown = ({ intl, onManageChatKey }) => {
  const { mutateAsync: logout } = useLogoutFromChats();

  const bottomSheetModalRef = useRef();

  const dropdownOption = useMemo(
    () => [
      {
        title: intl.formatMessage({ id: 'chat.manage-chat-key' }),
        onPress: onManageChatKey,
        iconName: 'key',
        show: !!onManageChatKey,
      },
      {
        title: intl.formatMessage({ id: 'chat.logout' }),
        onPress: () => logout(),
        iconName: 'vpn-key',
        show: true,
      },
    ],
    [intl, logout],
  );

  const onPressDropdownHandler = useCallback(
    (onPress) => () => {
      onPress?.();
      bottomSheetModalRef.current?.hide();
    },
    [],
  );

  return (
    <>
      <ActionSheet
        ref={bottomSheetModalRef}
        gestureEnabled={true}
        containerStyle={modalStyles.sheetContent}
        indicatorStyle={modalStyles.sheetIndicator}
        onClose={() => bottomSheetModalRef.current?.hide()}
      >
        <View style={modalStyles.modal}>
          <Separator style={modalStyles.separator} />
          {dropdownOption.map(({ title, onPress, show, iconName }) =>
            show ? (
              <View key={`dropDownItem${title}`}>
                <TouchableOpacity
                  style={modalStyles.button}
                  onPress={onPressDropdownHandler(onPress)}
                >
                  <View style={modalStyles.buttonTextWrapper}>
                    <Text style={modalStyles.textButton}>{title}</Text>
                    {iconName && (
                      <Icon style={styles.dropdownIcon} name={iconName} iconType="MaterialIcons" />
                    )}
                  </View>
                </TouchableOpacity>
                <Separator style={modalStyles.separator} />
              </View>
            ) : null,
          )}
        </View>
      </ActionSheet>

      <TouchableOpacity onPress={() => bottomSheetModalRef.current?.show()}>
        <Icon style={styles.dropdownIcon} name="more-vert" iconType="MaterialIcons" />
      </TouchableOpacity>
    </>
  );
};

export default injectIntl(ChatDropdown);
