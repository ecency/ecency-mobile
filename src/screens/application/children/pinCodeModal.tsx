
import React, { useEffect, useRef } from 'react'
import { AppState } from 'react-native';
import { Modal } from '../../../components';
import { useAppDispatch, useAppSelector } from '../../../hooks'
import { getExistUser } from '../../../realm/realm';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import PinCode from '../../pinCode';


const PinCodeModal = () => {
    const dispatch = useAppDispatch();

    const pinCodeTimer = useRef<any>(null);
    const appState = useRef(AppState.currentState);

    const isPinCodeRequire = useAppSelector(state => state.application.isPinCodeRequire);
    const isPinCodeOpen = useAppSelector(state => state.application.isPinCodeOpen);


    useEffect(() => {
        AppState.addEventListener('change', _handleAppStateChange);
        return _unmount
    }, [])


    const _unmount = () => {
        AppState.removeEventListener('change', _handleAppStateChange);
    }


    const _handleAppStateChange = (nextAppState) => {
        getExistUser().then((isExistUser) => {
            if (isExistUser) {
                if (appState.current.match(/active|forground/) && nextAppState === 'inactive') {
                    _startPinCodeTimer();
                }

                if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
                    if (isPinCodeOpen && pinCodeTimer.current) {
                        clearTimeout(pinCodeTimer.current);
                    }
                }
            }
        });

        appState.current = nextAppState;
    };



    const _startPinCodeTimer = () => {
        if (isPinCodeOpen) {
            pinCodeTimer.current = setTimeout(() => {
                dispatch(openPinCodeModal());
            }, 1 * 60 * 1000);
        }
    };


    return (
        <Modal
            isOpen={isPinCodeRequire}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
            style={{ margin: 0 }}
        >
            <PinCode />
        </Modal>
    )
}

export default PinCodeModal