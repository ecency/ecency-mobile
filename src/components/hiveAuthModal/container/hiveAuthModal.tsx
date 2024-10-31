import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Linking, Alert, View, Text, ActivityIndicator, Keyboard } from 'react-native';

import HAS from 'hive-auth-wrapper';
import { v4 as uuidv4 } from 'uuid';
import { useIntl } from 'react-intl';
import { HiveSignerMessage } from 'utils/hive-signer-helper';
import { debounce } from 'lodash';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from 'react-native-actions-sheet';
import styles from '../styles/hiveAuthModal.styles';
import { getDigitPinCode, lookupAccounts } from '../../../providers/hive/dhive';
import { loginWithHiveAuth } from '../../../providers/hive/auth';
import { useAppSelector, usePostLoginActions } from '../../../hooks';
import ROUTES from '../../../constants/routeNames';
import AUTH_TYPE from '../../../constants/authType';
import { decryptKey } from '../../../utils/crypto';
import { FormInput, Icon, MainButton, ModalHeader } from '../..';
import HIVE_AUTH_ICON from '../../../assets/HiveAuth_logo.png';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, { FadeOut, LinearTransition, FadeInUp, FadeOutDown, ZoomIn, ZoomOut, ZoomInRotate, ZoomInEasyUp } from 'react-native-reanimated';
import { delay } from '../../../utils/editor';


const APP_META = {
    name: 'Ecency',
    description: 'Decentralised Social Blogging',
    icon: undefined,
};

enum Modes {
    AUTH = 0,
    SIGN = 1
}

enum Status {
    IDLE = 0,
    PROCESSING = 1,
    SUCCESS = 2,
    ERROR = 3
}

interface HiveAuthModalProps {
    onClose?: () => void;
}

export const HiveAuthModal = forwardRef(({ onClose }: HiveAuthModalProps, ref) => {
    useImperativeHandle(ref, () => ({
        showModal: (_username: string) => {
            if (_username) {
                setMode(Modes.AUTH)
                setUsername(_username || '');
                setStatus(Status.IDLE);
                setStatusText('');
            }
            bottomSheetModalRef.current?.show();
        },
        broadcastActiveOps: (opsArray: any) => {
            if (opsArray) {
                setOpsArray(opsArray);
                setMode(Modes.SIGN)
                setStatus(Status.IDLE);
                setStatusText('')
                bottomSheetModalRef.current?.show();
            }
        },
    }));

    const intl = useIntl();
    const navigation = useNavigation();
    const postLoginActions = usePostLoginActions();

    const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);
    const pinHash = useAppSelector((state) => state.application.pin);
    const currentAccount = useAppSelector((state) => state.account.currentAccount);

    const bottomSheetModalRef = useRef();

    const [mode, setMode] = useState(Modes.AUTH);

    const [username, setUsername] = useState('');
    const [statusText, setStatusText] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [status, setStatus] = useState(Status.IDLE);
    const [opsArray, setOpsArray] = useState<null | any>(null);

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

    const debouncedCheckValidity = debounce((uname) => {
        _checkUsernameIsValid(uname);
    }, 1000);

    useEffect(() => {
        if (username) {
            debouncedCheckValidity(username);

            return () => debouncedCheckValidity.cancel();
        }
    }, [username]);

    const _sendAuthReq = async () => {

        setStatusText("Initiating...")
        setStatus(Status.PROCESSING);

        Keyboard.dismiss();
        await delay(1000) //TODO: delay to assist modal settle height before show redirecting dialog

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
                    setStatusText("Authenticating...")
                    Linking.openURL(uri);
                } else {
                    // TOOD: prompt to install valid keychain app
                    setStatusText("No Hive Authentication App Found")
                    setStatus(Status.ERROR);
                }
            };

            const authRes = await HAS.authenticate(auth, APP_META, challenge_data, _cbWait);

            setStatusText('Logging In...')
            // update message with sign and encode to created hsCode
            messageObj.signatures = [authRes.data.challenge.challenge];
            const hsCode = btoa(JSON.stringify(messageObj));

            // handleOnModalClose();
            const accountData = await loginWithHiveAuth(hsCode, auth.key, auth.expire);

            postLoginActions.updateAccountsData(accountData);

            setStatusText("Authentication Success!")
            setStatus(Status.SUCCESS);

            await delay(3000);

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
            setStatusText(error.message)
            setStatus(Status.ERROR);
        }
    };

    const _broadcastActiveOps = async () => {
        try {
            setStatus(Status.PROCESSING);
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

            const _cdWait = (evt) => {
                console.log('sign wait', evt);
                Linking.openURL('has://sign_req');
            };

            const res = await HAS.broadcast(_hiveAuthObj, 'active', opsArray, _cdWait);

            if (res && res.broadcast) {
                console.log('broadcast response', res);
                // TODO: hive modal
                // respond back to transfer screen
            }

            setStatus(Status.SUCCESS);
        } catch (error) {
            setStatus(Status.ERROR);
            setStatusText(error.message)
        }
    };

    const _closeModal = () => {
        bottomSheetModalRef.current?.hide();
        if (onClose) {
            onClose();
        }
    };

    const _handleUsernameChange = (username: string) => {
        const formattedUsername = username.trim().toLowerCase();
        setUsername(formattedUsername);
    };

    const _checkUsernameIsValid = async (uname) => {
        try {
            const accts = await lookupAccounts(uname);
            const isValid = accts.includes(uname);
            setIsUsernameValid(isValid);
        } catch (err) {
            setIsUsernameValid(false);
        }
    };


    const _renderAuthContent = (
        <Animated.View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }} exiting={FadeOut}>
            <Animated.View style={{ width: '90%' }} layout={LinearTransition}>
                <FormInput
                    rightIconName="at"
                    leftIconName="close"
                    iconType="MaterialCommunityIcons"
                    isValid={isUsernameValid}
                    onChange={_handleUsernameChange}
                    placeholder={intl.formatMessage({
                        id: 'login.username',
                    })}
                    isEditable
                    type="username"
                    isFirstImage
                    value={username}
                    inputStyle={styles.input}
                    wrapperStyle={styles.inputWrapper}
                    onBlur={() => _checkUsernameIsValid(username)}
                />
            </Animated.View>

            {!!username && isUsernameValid &&
                <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                    <MainButton
                        text={intl.formatMessage({ id: 'login.signin_with' })}
                        secondText={" Hive"}
                        secondTextStyle={{ color: EStyleSheet.value('$primaryRed') }}
                        style={{ backgroundColor: 'transparent', marginTop: 12, borderWidth: 1, borderColor: EStyleSheet.value('$iconColor'), height: 44 }}
                        onPress={_sendAuthReq}
                        isDisable={!username || !isUsernameValid}
                        isLoading={status === Status.PROCESSING}
                        source={HIVE_AUTH_ICON}
                    />
                </Animated.View>
            }

        </Animated.View>
    )


    const _renderSignContent = (
        <>
            {!!opsArray && (
                <>
                    <MainButton
                        text="Broadcast Transaction"
                        onPress={_broadcastActiveOps}
                        // isDisable={!username || !isUsernameValid}
                        isLoading={status === Status.PROCESSING}
                    />
                </>
            )}
        </>
    )

    const _renderResultIcon = (iconName: string, colorId: string) => (
        <Animated.View entering={ZoomIn.springify().duration(500)} exiting={ZoomOut}>
            <Icon
                iconType="AntDesign"
                name={iconName}
                color={EStyleSheet.value(colorId)}
                size={88}
                style={styles.resultIcon}
            />
        </Animated.View>
    )

    const _renderProcessContent = (
        <>
            {status === Status.SUCCESS &&
                _renderResultIcon('checkcircle', '$primaryGreen')}
            {status === Status.ERROR &&
                _renderResultIcon('closecircle', '$primaryRed')}

            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }} layout={LinearTransition} entering={FadeInUp} exiting={(FadeOutDown)}>
                {status === Status.PROCESSING &&
                    <ActivityIndicator
                        style={{ marginRight: 16 }}
                        size={'large'}
                        color={EStyleSheet.value('$primaryBlue')} />
                }
                <Text style={{ color: EStyleSheet.value('$primaryDarkText'), fontWeight: 300, fontSize: 24 }}>{statusText}</Text>
            </Animated.View >
        </>
    )


    const _renderContent = (
        <View style={styles.container}>
            <ModalHeader title="Hive Auth" isCloseButton={true} onClosePress={_closeModal} />
            <View style={styles.content}>
                {status !== Status.IDLE ? _renderProcessContent :
                    mode === Modes.AUTH ? _renderAuthContent : _renderSignContent}
            </View>
        </View>
    );

    return (
        <ActionSheet
            ref={bottomSheetModalRef}
            gestureEnabled={false}
            hideUnderlay={true}
            onClose={() => {
                setStatus(false);
                setUsername('')
            }}
            containerStyle={styles.sheetContent}
            indicatorStyle={styles.indicator}
        >
            {_renderContent}
        </ActionSheet>
    );
});
