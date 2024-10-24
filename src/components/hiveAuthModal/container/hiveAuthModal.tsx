import { FormInput, MainButton, ModalHeader } from '../../../components';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Linking, Alert, View } from 'react-native';

import HAS from 'hive-auth-wrapper';
import { v4 as uuidv4 } from "uuid";
import { useIntl } from 'react-intl';
import styles from '../styles/hiveAuthModal.styles'
import { lookupAccounts } from '../../../providers/hive/dhive';
import { loginWithHiveAuth } from '../../../providers/hive/auth';
import { useAppSelector, usePostLoginActions } from '../../../hooks';
import { HiveSignerMessage } from 'utils/hive-signer-helper';
import { debounce } from 'lodash';
import ROUTES from '../../../constants/routeNames';
import { useNavigation } from '@react-navigation/native';
import ActionSheet from 'react-native-actions-sheet';


const APP_META = {
    name: "Ecency",
    description: "Decentralised Social Blogging",
    icon: undefined
}


export const HiveAuthModal = forwardRef((_, ref) => {

    useImperativeHandle(ref, () => ({
        showModal: (_username:string) => {
            if(_username){
                setUsername(_username)
            }
            bottomSheetModalRef.current?.show();
        }
    }))

    const intl = useIntl();
    const navigation = useNavigation();
    const postLoginActions = usePostLoginActions();

    const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen)


    const bottomSheetModalRef = useRef();

    const [username, setUsername] = useState('');
    const [isUsernameValid, setIsUsernameValid] = useState(true);
    const [isLoading, setIsLoading] = useState(false);


    useEffect(() => {
        // Your application information
        // const APP_META = { name: "Ecency", description: "My HAS compatible application", icon: undefined }

        // Retrieving connection status
        HAS.connect().then(() => {
            const status = HAS.status();
            console.log("has status", status)
        })
        // console.log(status)

    }, []);



    const debouncedCheckValidity = debounce((uname) => {
        _checkUsernameIsValid(uname);
    }, 500);

    useEffect(() => {
        if (username) {
            debouncedCheckValidity(username);

            return () => debouncedCheckValidity.cancel();
        }
    }, [username]);


    const _sendAuthReq = async () => {
        setIsLoading(true);
        try {
            // Create an authentication object
            const auth = {
                username: username,  // required - replace "username" with your Hive account name (without the @)
                expire: undefined,
                key: uuidv4()
            }

            // create a challenge/message to sign with the posting key
            // this sign is required for enabled hive sigenr support
            const timestamp = new Date().getTime() / 1000;
            const messageObj: HiveSignerMessage = {
                signed_message: { type: 'refresh', app: 'ecency.app' },
                authors: [auth.username],
                timestamp,
            };

            const challenge_data = {
                key_type: "posting",
                challenge: JSON.stringify(messageObj)
            }

            // callback to initiate keychain authenticated request
            const _cbWait = async (evt) => {
                console.log(evt)    // process auth_wait message

                const { username, key } = auth;
                const { host } = HAS.status()
                const { uuid } = evt;

                const payload = {
                    account: username,
                    uuid,
                    key,
                    host
                }

                const encodedData = btoa(JSON.stringify(payload));

                console.log(encodedData);

                const uri = `has://auth_req/${encodedData}`

                const _canOpenUri = await Linking.canOpenURL(uri);
                if (_canOpenUri) {
                    Linking.openURL(uri);
                } else {
                    //TOOD: prompt to install valid keychain app
                }

            }

            const authRes = await HAS.authenticate(auth, APP_META, challenge_data, _cbWait)

            //update message with sign and encode to created hsCode
            messageObj.signatures = [authRes.data.challenge.challenge];
            const hsCode = btoa(JSON.stringify(messageObj));

            // handleOnModalClose();
            const accountData = await loginWithHiveAuth(hsCode, auth.key, auth.expire)

            postLoginActions.updateAccountsData(accountData);

            setIsLoading(false);

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

        }
        catch (error) {
            setIsLoading(true);
            console.warn("Login failed")
            Alert.alert(
                intl.formatMessage({ id: 'alert.fail' }),
                intl.formatMessage({
                    id: error.message,
                }),
            );
        }

    }



    // const _sendVoteReq = () => {
    //     console.log("expire check", auth.expire, new Date().getTime())
    //     // if(auth.expire && auth.expire > new Date().getTime()){

    //     const args = [
    //         [
    //             'vote',
    //             {
    //                 voter: 'demo.com',
    //                 author: 'demo.com',
    //                 permlink: 'test-from-ecency-app',
    //                 weight: 5000,
    //             },
    //         ],
    //     ];

    //     HAS.broadcast(auth, 'posting', args, (evt) => {
    //         console.log("sign wait", evt)
    //         Linking.openURL("has://sign_req");
    //     }).then((res) => {
    //         console.log("broadcast complete", res)
    //     }).catch((e) => {
    //         console.log("broadcast fail", e)
    //     })

    // }

    const _closeModal = () => {
        bottomSheetModalRef.current?.hide()
    }

    const _handleUsernameChange = (username: string) => {
        const formattedUsername = username.trim().toLowerCase();
        setUsername(formattedUsername);
    };

    const _checkUsernameIsValid = async (uname) => {
        try {
            const accts = await lookupAccounts(uname)
            const isValid = accts.includes(uname);
            setIsUsernameValid(isValid);
        } catch (err) {
            setIsUsernameValid(false);
        }
    };

    const _renderContent = (
        <View style={styles.container} >
            <ModalHeader title="Hive Auth" isCloseButton={true} onClosePress={_closeModal} />
            <View style={styles.content}>
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
                    onBlur={() => _checkUsernameIsValid(username)}
                />


                <MainButton
                    text="Login with HiveAuth"
                    onPress={_sendAuthReq}
                    isDisable={!username || !isUsernameValid}
                    isLoading={isLoading}
                />
            </View>

        </View>
    );

    return (
        <ActionSheet
            ref={bottomSheetModalRef}
            gestureEnabled={false}
            hideUnderlay={true}
            containerStyle={styles.sheetContent}
            indicatorStyle={styles.indicator}
        >
            {_renderContent}
        </ActionSheet>
    );



});

