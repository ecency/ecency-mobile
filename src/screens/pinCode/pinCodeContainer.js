import React from "react";
import { AsyncStorage } from "react-native";

import {
    setUserDataWithPinCode,
    verifyPinCode,
} from "../../providers/steem/auth";

import { default as INITIAL } from "../../constants/initial";

import PinCodeScreen from "./pinCodeScreen";

class PinCodeContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExistUser: null,
            informationText: "",
            pinCode: null,
        };
    }

    // TODO: if check for decide to set to pin or verify to pin page
    componentDidMount() {
        this._getDataFromStorage().then(() => {
            const { isExistUser } = this.state;
            if (isExistUser) {
                this.setState({
                    informationText: "verify screen",
                });
            } else {
                this.setState({
                    informationText: "setup screen",
                });
            }
        });
    }

    _getDataFromStorage = () =>
        new Promise(resolve => {
            AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
                this.setState(
                    {
                        isExistUser: JSON.parse(result),
                    },
                    resolve
                );
            });
        });

    _setPinCode = pin => {
        const { isExistUser, pinCode } = this.state;

        if (isExistUser) {
            // If the user is exist, we are just checking to pin and navigating to home screen
            verifyPinCode(pinCode, "").then(() => {});
            // TODO navigate to home
        } else {
            // If the user is logging in for the first time, the user should set to pin
            if (!pinCode) {
                this.setState({
                    informationText: "write again",
                    pinCode: pin,
                });
            } else {
                if (pinCode === pin) {
                    setUserDataWithPinCode(pinCode, "").then(() => {});
                    // TODO navigate to home
                } else {
                    this.setState({
                        informationText: "wrongggg!!!",
                    });
                    setTimeout(() => {
                        this.setState({
                            informationText: "setup screen",
                            pinCode: null,
                        });
                    }, 1000);
                }
            }
        }
    };

    render() {
        const { informationText } = this.state;
        return (
            <PinCodeScreen
                informationText={informationText}
                setPinCode={this._setPinCode}
            />
        );
    }
}

export default PinCodeContainer;
