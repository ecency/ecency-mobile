import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import { useIntl } from 'react-intl';
import { Icon } from '../icon';

const FALLBACK_SHEET_ID = 'receive_qr';

const ReceiveQrSheet: React.FC<SheetProps<'receive_qr'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const closedRef = useRef(false);

  useEffect(() => {
    closedRef.current = false;
  }, [payload]);

  const username = payload?.username || '';
  const qrValue = `ecency://transfer?to=${username}`;

  const _onCopy = () => {
    Clipboard.setString(username);
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        <Text style={styles.title}>
          {intl.formatMessage({ id: 'wallet.receive', defaultMessage: 'Receive' })}
        </Text>
        <Text style={styles.subtitle}>
          {intl.formatMessage({
            id: 'wallet.receive_desc',
            defaultMessage: 'Scan this QR code to send funds to this account',
          })}
        </Text>

        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} backgroundColor="white" color="black" />
        </View>

        <TouchableOpacity style={styles.usernameRow} onPress={_onCopy} activeOpacity={0.7}>
          <Text style={styles.usernameText}>@{username}</Text>
          <Icon
            iconType="MaterialCommunityIcons"
            name="content-copy"
            size={18}
            color={EStyleSheet.value('$primaryBlue')}
          />
        </TouchableOpacity>
      </View>
    </ActionSheet>
  );
};

export default ReceiveQrSheet;

const styles = EStyleSheet.create({
  sheetContainer: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '$iconColor',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
    marginRight: 8,
  },
});
