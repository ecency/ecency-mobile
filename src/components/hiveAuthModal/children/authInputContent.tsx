
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { debounce } from 'lodash';
import EStyleSheet from 'react-native-extended-stylesheet';
import Animated, {
    FadeOut,
    LinearTransition,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import styles from '../styles/hiveAuthModal.styles';
import { lookupAccounts } from '../../../providers/hive/dhive';
import { FormInput, MainButton } from '../..';
import HIVE_AUTH_ICON from '../../../assets/HiveAuth_logo.png';




interface AuthInputContentProps {
    initUsername?: string,
    handleAuthRequest: (username: string) => void
}


export const AuthInputContent = ({ initUsername, handleAuthRequest }: AuthInputContentProps) => {
    const intl = useIntl();

    const [username, setUsername] = useState(initUsername || '');
    const [isUsernameValid, setIsUsernameValid] = useState(false);

    const debouncedCheckValidity = debounce((uname: string) => {
        _checkUsernameIsValid(uname);
    }, 500);

    useEffect(() => {
        if(initUsername){
            setUsername(initUsername)
        }
    }, [initUsername])

    useEffect(() => {
        debouncedCheckValidity(username);
        return () => debouncedCheckValidity.cancel();
    }, [username]);

    const _handleUsernameChange = (username: string) => {
        const formattedUsername = username.trim().toLowerCase();
        setUsername(formattedUsername);
    };

    const _checkUsernameIsValid = async (uname: string) => {
        try {
            const accts = await lookupAccounts(uname);
            const isValid = accts.includes(uname);
            setIsUsernameValid(isValid);
        } catch (err) {
            setIsUsernameValid(false);
        }
    };

    const onSignInPress = () => {
        if (handleAuthRequest) {
            handleAuthRequest(username)
        }
    }

    return (
        <Animated.View
            style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
            exiting={FadeOut}
        >
            <Animated.View style={{ width: '90%' }} layout={LinearTransition}>
                <FormInput
                    rightIconName="at"
                    leftIconName="close"
                    iconType="MaterialCommunityIcons"
                    isValid={!username || isUsernameValid}
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

            {isUsernameValid && (
                <Animated.View entering={ZoomIn} exiting={ZoomOut}>
                    <MainButton
                        text={intl.formatMessage({ id: 'login.signin_with_hiveauth' })}
                       
                        style={{
                            backgroundColor: 'transparent',
                            marginTop: 12,
                            borderWidth: 1,
                            borderColor: EStyleSheet.value('$iconColor'),
                            height: 44,
                        }}
                        onPress={onSignInPress}
                        source={HIVE_AUTH_ICON}
                    />
                </Animated.View>
            )}
        </Animated.View>
    )
};