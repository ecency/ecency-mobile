import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import ActionSheet, { SheetManager, SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useIntl } from 'react-intl';
import { MainButton } from '../../../components/mainButton';
import { Icon } from '../../../components/icon';
import { OPERATION_LABELS, getRequiredAuthority } from '../bridges/bridgeTypes';

const FALLBACK_SHEET_ID = 'keychain_confirm';

const KeychainConfirmSheet: React.FC<SheetProps<'keychain_confirm'>> = ({ sheetId, payload }) => {
  const intl = useIntl();
  const closedRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    closedRef.current = false;
    setIsProcessing(false);
  }, [payload]);

  const _close = (approved: boolean) => {
    if (closedRef.current) return;
    closedRef.current = true;
    SheetManager.hide(sheetId || FALLBACK_SHEET_ID, { payload: approved });
  };

  const type = payload?.type || '';
  const domain = payload?.domain || '';
  const username = payload?.username || '';
  const authority = getRequiredAuthority(type, payload?.method);
  const label = OPERATION_LABELS[type] || type;

  const _renderDetail = (detailLabel: string, value: string) => {
    if (!value) return null;
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{detailLabel}</Text>
        <Text style={styles.detailValue} numberOfLines={2} ellipsizeMode="middle">
          {value}
        </Text>
      </View>
    );
  };

  const _renderOperationDetails = () => {
    if (!payload) return null;
    const data = payload;

    switch (type) {
      case 'transfer':
        return (
          <>
            {_renderDetail('To', data.to)}
            {_renderDetail('Amount', `${data.amount} ${data.currency}`)}
            {_renderDetail('Memo', data.memo)}
          </>
        );
      case 'vote':
        return (
          <>
            {_renderDetail('Author', data.author)}
            {_renderDetail('Permlink', data.permlink)}
            {_renderDetail('Weight', `${(data.weight / 100).toFixed(0)}%`)}
          </>
        );
      case 'custom':
        return (
          <>
            {_renderDetail('ID', data.id)}
            {data.display_msg && _renderDetail('Info', data.display_msg)}
          </>
        );
      case 'delegation':
        return (
          <>
            {_renderDetail('Delegatee', data.delegatee)}
            {_renderDetail('Amount', `${data.amount} ${data.unit}`)}
          </>
        );
      case 'post':
        return (
          <>
            {_renderDetail('Title', data.title)}
            {_renderDetail('Permlink', data.permlink)}
            {data.parent_username && _renderDetail('Reply to', `@${data.parent_username}`)}
          </>
        );
      case 'sendToken':
        return (
          <>
            {_renderDetail('To', data.to)}
            {_renderDetail('Amount', `${data.amount} ${data.currency}`)}
            {_renderDetail('Memo', data.memo)}
          </>
        );
      case 'powerUp':
        return (
          <>
            {_renderDetail('Recipient', data.recipient)}
            {_renderDetail('Amount', `${data.steem} HIVE`)}
          </>
        );
      case 'powerDown':
        return <>{_renderDetail('Amount', `${data.steem_power} HP`)}</>;
      case 'witnessVote':
        return (
          <>
            {_renderDetail('Witness', data.witness)}
            {_renderDetail('Vote', data.vote ? 'Approve' : 'Remove')}
          </>
        );
      case 'proxy':
        return <>{_renderDetail('Proxy', data.proxy || '(remove)')}</>;
      case 'signBuffer':
        return <>{_renderDetail('Message', data.message?.substring(0, 200))}</>;
      case 'broadcast':
        return (
          <>
            {_renderDetail(
              'Operations',
              Array.isArray(data.operations) ? `${data.operations.length} operation(s)` : '—',
            )}
          </>
        );
      case 'recurrentTransfer':
        return (
          <>
            {_renderDetail('To', data.to)}
            {_renderDetail('Amount', `${data.amount} ${data.currency}`)}
            {_renderDetail('Recurrence', `Every ${data.recurrence}h`)}
            {_renderDetail('Executions', `${data.executions}`)}
          </>
        );
      case 'savings':
        return (
          <>
            {_renderDetail('To', data.to)}
            {_renderDetail('Amount', `${data.amount} ${data.currency}`)}
            {_renderDetail('Operation', data.operation)}
          </>
        );
      case 'convert':
        return (
          <>
            {_renderDetail('Amount', data.amount)}
            {_renderDetail('Type', data.collaterized ? 'HIVE to HBD' : 'HBD to HIVE')}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ActionSheet
      id={sheetId || FALLBACK_SHEET_ID}
      gestureEnabled
      closeOnTouchBackdrop={!isProcessing}
      containerStyle={styles.sheetContainer}
      onClose={() => _close(false)}
    >
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="shield-check"
            size={40}
            color={EStyleSheet.value('$primaryBlue')}
          />
        </View>

        <Text style={styles.title}>{label}</Text>

        <View style={styles.domainContainer}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="web"
            size={16}
            color={EStyleSheet.value('$iconColor')}
          />
          <Text style={styles.domainText} numberOfLines={1}>
            {domain}
          </Text>
        </View>

        <ScrollView style={styles.detailsContainer} bounces={false}>
          {_renderDetail('Account', username ? `@${username}` : '—')}
          {_renderDetail('Authority', authority.toUpperCase())}
          {_renderOperationDetails()}
        </ScrollView>

        {isProcessing ? (
          <ActivityIndicator
            size="large"
            color={EStyleSheet.value('$primaryBlue')}
            style={styles.loader}
          />
        ) : (
          <View style={styles.buttonsContainer}>
            <MainButton
              style={styles.confirmButton}
              onPress={() => _close(true)}
              text={intl.formatMessage({ id: 'alert.confirm', defaultMessage: 'Confirm' })}
            />
            <MainButton
              style={styles.cancelButton}
              onPress={() => _close(false)}
              text={intl.formatMessage({ id: 'alert.cancel', defaultMessage: 'Cancel' })}
              isTransparent
            />
          </View>
        )}
      </View>
    </ActionSheet>
  );
};

export default KeychainConfirmSheet;

const styles = EStyleSheet.create({
  sheetContainer: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 8,
  },
  domainContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 20,
    alignSelf: 'center',
  },
  domainText: {
    fontSize: 13,
    color: '$iconColor',
    marginLeft: 6,
    maxWidth: 250,
  },
  detailsContainer: {
    maxHeight: 280,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: EStyleSheet.hairlineWidth,
    borderBottomColor: '$primaryLightBackground',
  },
  detailLabel: {
    fontSize: 14,
    color: '$iconColor',
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '$primaryBlack',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  buttonsContainer: {
    gap: 10,
  },
  confirmButton: {
    backgroundColor: '$primaryBlue',
  },
  cancelButton: {
    borderWidth: 0,
  },
  loader: {
    marginVertical: 20,
  },
});
