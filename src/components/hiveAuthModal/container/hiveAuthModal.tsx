import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Linking, View, Keyboard } from 'react-native';

import HAS from 'hive-auth-wrapper';
import { v4 as uuidv4 } from 'uuid';
import { useIntl } from 'react-intl';
import { HiveSignerMessage } from 'utils/hive-signer-helper';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from 'react-native-actions-sheet';
import styles from '../styles/hiveAuthModal.styles';
import { getDigitPinCode } from '../../../providers/hive/dhive';
import { loginWithHiveAuth } from '../../../providers/hive/auth';
import { useAppSelector, usePostLoginActions } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import AUTH_TYPE from '../../../constants/authType';
import { decryptKey } from '../../../utils/crypto';
import { ModalHeader } from '../..';
import { delay } from '../../../utils/editor';
import { AuthInputContent } from '../children/authInputContent';
import { StatusContent } from '../children/statusContent';

const APP_META = {
  name: 'Ecency',
  description: 'Decentralised Social Blogging',
  icon: undefined,
};

export enum HiveAuthStatus {
  INPUT = 0,
  PROCESSING = 1,
  SUCCESS = 2,
  ERROR = 3,
}

interface HiveAuthModalProps {
  onClose?: () => void;
}

export const HiveAuthModal = forwardRef(({ onClose }: HiveAuthModalProps, ref) => {

  const intl = useIntl();
  const navigation = useNavigation();
  const postLoginActions = usePostLoginActions();

  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);
  const pinHash = useAppSelector((state) => state.application.pin);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);

  const bottomSheetModalRef = useRef();

  const [initUsername, setInitUsername] = useState<string>();
  const [statusText, setStatusText] = useState('');
  const [status, setStatus] = useState(HiveAuthStatus.INPUT);

  useImperativeHandle(ref, () => ({
    showModal: (_username?: string) => {
      setInitUsername(_username);
      setStatus(HiveAuthStatus.INPUT);
      setStatusText('');
      bottomSheetModalRef.current?.show();
    },
    broadcastActiveOps: (opsArray: any) => {
      if (opsArray) {

        setStatus(HiveAuthStatus.PROCESSING);
        setStatusText('Initializing...');
        bottomSheetModalRef.current?.show();
        delay(2000).then(() => {
          _broadcastActiveOps(opsArray);
        });
      }
    },
  }));

  useEffect(() => {
    // Your application information
    // const APP_META = { name: "Ecency", description: "My HAS compatible application", icon: undefined }

    // Retrieving connection status
    HAS.connect().then(() => {
      const _status = HAS.status();
      console.log('has status', _status);
    });
    // console.log(status)
  }, []);



  const handleAuthRequest = async (username:string) => {
    setStatusText('Initiating...');
    setStatus(HiveAuthStatus.PROCESSING);

    Keyboard.dismiss();
    await delay(1000); // TODO: delay to assist modal settle height before show redirecting dialog

    try {
      // Create an authentication object
      const auth = {
        username, // required - replace "username" with your Hive account name (without the @)
        expire: undefined,
        key: uuidv4(),
      };

      // create a challenge/message to sign with the posting key
      // this sign is required for enabled hive sigenr support
      const timestamp = new Date().getTime() / 1000;
      const messageObj: HiveSignerMessage = {
        signed_message: { type: 'refresh', app: 'ecency.app' },
        authors: [auth.username],
        timestamp,
      };

      const challenge_data = {
        key_type: 'posting',
        challenge: JSON.stringify(messageObj),
      };

      // callback to initiate keychain authenticated request
      const _cbWait = async (evt) => {
        console.log(evt); // process auth_wait message

        const { username, key } = auth;
        const { host } = HAS.status();
        const { uuid } = evt;

        const payload = {
          account: username,
          uuid,
          key,
          host,
        };

        const encodedData = btoa(JSON.stringify(payload));

        console.log(encodedData);

        const uri = `has://auth_req/${encodedData}`;

        const _canOpenUri = await Linking.canOpenURL(uri);
        if (_canOpenUri) {
          setStatusText('Authenticating...');
          Linking.openURL(uri);
        } else {
          // TOOD: prompt to install valid keychain app
          setStatusText('Hive Authentication App Not Installed');
          setStatus(HiveAuthStatus.ERROR);
        }
      };

      const authRes = await HAS.authenticate(auth, APP_META, challenge_data, _cbWait);

      setStatusText('Logging In...');
      // update message with sign and encode to created hsCode
      messageObj.signatures = [authRes.data.challenge.challenge];
      const hsCode = btoa(JSON.stringify(messageObj));

      // handleOnModalClose();
      const accountData = await loginWithHiveAuth(hsCode, auth.key, auth.expire);

      postLoginActions.updateAccountsData(accountData);

      setStatusText('Authentication Success!');
      setStatus(HiveAuthStatus.SUCCESS);

      await delay(2000);

      if (isPinCodeOpen) {
        navigation.navigate({
          name: ROUTES.SCREENS.PINCODE,
          params: {
            accessToken: accountData.accessToken,
            navigateTo: ROUTES.DRAWER.MAIN,
          },
        });
      } else {
        navigation.navigate({
          name: ROUTES.DRAWER.MAIN,
          params: { accessToken: accountData.accessToken },
        });
      }
    } catch (error) {
      console.warn('Login failed');
      setStatusText(error.message || 'Authentication Failed');
      setStatus(HiveAuthStatus.ERROR);
    }
  };

  const _broadcastActiveOps = async (opsArray: any) => {
    try {
      setStatus(HiveAuthStatus.PROCESSING);
      setStatusText('Initializing...');
      if (currentAccount.local.authType !== AUTH_TYPE.HIVE_AUTH) {
        throw new Error('Invalid auth type');
      }

      const _hiveAuthObj = {
        username: currentAccount.username,
        expiry: currentAccount.local.hiveAuthExpiry,
        key: decryptKey(currentAccount.local.hiveAuthKey, getDigitPinCode(pinHash)),
      };

      if (!_hiveAuthObj.key) {
        throw new Error('Failed to decrypt hive auth key');
      }

      if (_hiveAuthObj.expiry < new Date().getTime()) {
        console.log('expire check', _hiveAuthObj.expiry, new Date().getTime());
        throw new Error('Hive Auth Key is expired, reauthenticate and try again');
      }

      if (!opsArray) {
        throw new Error('Missing operations array to broadcast');
      }

      const _cdWait = async (evt) => {
        console.log('sign wait', evt);

        const _canOpenUri = await Linking.canOpenURL('has://sign_req');
        if (_canOpenUri) {
          setStatusText('Requesting...');
          Linking.openURL('has://sign_req');
        } else {
          throw new Error('No compatible app installed');
        }
      };

      const res = await HAS.broadcast(_hiveAuthObj, 'active', opsArray, _cdWait);

      if (res && res.broadcast) {
        console.log('broadcast response', res);
        // TODO: hive modal
        // respond back to transfer screen
      }

      setStatus(HiveAuthStatus.SUCCESS);
      setStatusText('Transaction Successful!');
      await delay(2000);

      _closeModal();
    } catch (error) {
      setStatus(HiveAuthStatus.ERROR);
      setStatusText(error.message || 'Transaction Rejected!');
    }
  };

  const _closeModal = () => {
    bottomSheetModalRef.current?.hide();
    if (onClose) {
      onClose();
    }
  };


  const _renderContent = () => {

    const _content = status === HiveAuthStatus.INPUT
      ? <AuthInputContent initUsername={initUsername} handleAuthRequest={handleAuthRequest} />
      : <StatusContent status={status} statusText={statusText} />


    return (
      <View style={styles.container}>
        <ModalHeader
          title="Hive Auth"
          isCloseButton={true}
          onClosePress={_closeModal} />

        <View style={styles.content}>
          {_content}
        </View>

      </View>
    )
  };

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={false}
      hideUnderlay={true}
      onClose={() => {
        setStatus(HiveAuthStatus.INPUT);
        setStatusText('');
        setInitUsername(undefined);
      }}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      {_renderContent()}
    </ActionSheet>
  );
});
