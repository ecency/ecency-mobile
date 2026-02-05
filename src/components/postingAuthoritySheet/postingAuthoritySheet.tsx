import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { useIntl } from 'react-intl';
import ActionSheet, { SheetProps } from 'react-native-actions-sheet';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { selectCurrentAccount, selectPin } from '../../redux/selectors';
import { MainButton } from '../mainButton';
import { ActivityIndicator, Icon } from '../basicUIElements';
import { getAccount, grantPostingPermission } from '../../providers/hive/dhive';
import { toastNotification } from '../../redux/actions/uiAction';
import AUTH_TYPE from '../../constants/authType';
import { useHiveAuth } from '../hiveAuthModal/hooks/useHiveAuth';
import { updateCurrentAccount } from '../../redux/actions/accountAction';

const PostingAuthoritySheet: React.FC<SheetProps<'posting_authority_prompt'>> = ({ sheetId }) => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const currentAccount = useAppSelector(selectCurrentAccount);
  const pinHash = useAppSelector(selectPin);
  const [isGranting, setIsGranting] = useState(false);
  const { broadcast: hiveAuthBroadcast } = useHiveAuth();

  const _handleGrant = async () => {
    if (!currentAccount) {
      return;
    }

    // Check if PIN is set (not needed for HiveAuth, but needed for key-based auth)
    const isHiveAuth = currentAccount.local?.authType === AUTH_TYPE.HIVE_AUTH;
    if (!isHiveAuth && (!pinHash || pinHash === '')) {
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.pin_not_set' })));
      ActionSheet.hide(sheetId);
      return;
    }

    setIsGranting(true);
    try {
      const hasPostingAuth =
        currentAccount.posting?.account_auths?.some((auth: any) => auth[0] === 'ecency.app') ||
        false;
      if (hasPostingAuth) {
        ActionSheet.hide(sheetId);
        return;
      }

      const json = currentAccount.posting_json_metadata || '{}';

      // For HiveAuth users, we need to use broadcast method to sign with active key
      if (isHiveAuth) {
        const existingAuths = currentAccount.posting?.account_auths || [];
        const updatedAuths = existingAuths.some((auth) => auth[0] === 'ecency.app')
          ? [...existingAuths]
          : [...existingAuths, ['ecency.app', currentAccount.posting?.weight_threshold || 1]];
        updatedAuths.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

        // Build account_update operation
        const newPosting = {
          ...currentAccount.posting,
          account_auths: updatedAuths,
        };

        const operation = [
          'account_update',
          {
            account: currentAccount.name,
            posting: newPosting,
            memo_key: currentAccount.memo_key,
            json_metadata: json,
          },
        ];

        // This will open the keychain app for user to sign with active key
        const broadcastOk = await hiveAuthBroadcast([operation]);
        if (!broadcastOk) {
          throw new Error(intl.formatMessage({ id: 'posting_authority.error' }));
        }
      } else {
        // For key-based auth, use the standard flow
        const result = await grantPostingPermission(json, pinHash, currentAccount);
        if (!result) {
          throw new Error(intl.formatMessage({ id: 'posting_authority.error' }));
        }
      }

      try {
        const refreshed = await getAccount(currentAccount.name || currentAccount.username);
        if (refreshed) {
          dispatch(
            updateCurrentAccount({
              ...currentAccount,
              ...refreshed,
              local: currentAccount.local,
              accessToken: currentAccount.accessToken,
            }),
          );
        }
      } catch (refreshError) {
        console.warn('Failed to refresh account after posting authority grant', refreshError);
      }

      dispatch(toastNotification(intl.formatMessage({ id: 'posting_authority.success' })));

      ActionSheet.hide(sheetId);
    } catch (error) {
      console.error('Failed to grant posting permission:', error);
      const errorMessage = error?.message || intl.formatMessage({ id: 'posting_authority.error' });
      dispatch(toastNotification(errorMessage));
    } finally {
      setIsGranting(false);
    }
  };

  const _handleSkip = () => {
    ActionSheet.hide(sheetId);
  };

  return (
    <ActionSheet
      id={sheetId}
      gestureEnabled={!isGranting}
      closeOnTouchBackdrop={!isGranting}
      containerStyle={styles.sheetContainer}
    >
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="key-variant"
            size={48}
            color={EStyleSheet.value('$primaryBlue')}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>{intl.formatMessage({ id: 'posting_authority.title' })}</Text>

        {/* Description */}
        <Text style={styles.description}>
          {intl.formatMessage({ id: 'posting_authority.description' })}
        </Text>

        {/* Benefits List */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <Icon
              iconType="MaterialCommunityIcons"
              name="check-circle"
              size={20}
              color={EStyleSheet.value('$primaryGreen')}
            />
            <Text style={styles.benefitText}>
              {intl.formatMessage({ id: 'posting_authority.benefit_1' })}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              iconType="MaterialCommunityIcons"
              name="check-circle"
              size={20}
              color={EStyleSheet.value('$primaryGreen')}
            />
            <Text style={styles.benefitText}>
              {intl.formatMessage({ id: 'posting_authority.benefit_2' })}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Icon
              iconType="MaterialCommunityIcons"
              name="check-circle"
              size={20}
              color={EStyleSheet.value('$primaryGreen')}
            />
            <Text style={styles.benefitText}>
              {intl.formatMessage({ id: 'posting_authority.benefit_3' })}
            </Text>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Icon
            iconType="MaterialCommunityIcons"
            name="shield-check"
            size={16}
            color={EStyleSheet.value('$primaryDarkGray')}
          />
          <Text style={styles.securityText}>
            {intl.formatMessage({ id: 'posting_authority.security_note' })}
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <MainButton
            onPress={_handleGrant}
            isLoading={isGranting}
            isDisabled={isGranting}
            text={intl.formatMessage({ id: 'posting_authority.grant_button' })}
            style={styles.grantButton}
          />
          <MainButton
            onPress={_handleSkip}
            isDisabled={isGranting}
            text={intl.formatMessage({ id: 'posting_authority.skip_button' })}
            style={styles.skipButton}
            textStyle={styles.skipButtonText}
          />
        </View>

        {isGranting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator />
            <Text style={styles.loadingText}>
              {intl.formatMessage({ id: 'posting_authority.granting' })}
            </Text>
          </View>
        )}
      </View>
    </ActionSheet>
  );
};

const styles = EStyleSheet.create({
  sheetContainer: {
    paddingHorizontal: 0,
  },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '$primaryDarkGray',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '$primaryBlack',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    color: '$primaryDarkGray',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  buttonsContainer: {
    gap: 12,
  },
  grantButton: {
    marginBottom: 0,
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '$primaryLightGray',
  },
  skipButtonText: {
    color: '$primaryDarkGray',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '$primaryDarkGray',
  },
});

export default PostingAuthoritySheet;
