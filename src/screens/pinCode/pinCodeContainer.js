import React from "react";
import { AsyncStorage } from "react-native";

import { setUserDataWithPinCode } from "../../providers/steem/auth";

import { default as INITIAL } from "../../constants/initial";

import PinCodeScreen from "./pinCodeScreen";

class PinCodeContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    _getDataFromStorage = () => {
        AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
            console.log("err", err);
            console.log("result", result);
            this.setState({
                isFirstLaunch: JSON.parse(result),
            });
        });
    };

    // TODO: if check for decide to set to pin or verify to pin page

    // componentDidMount() {
    // 	this._getDataFromStorage();
    // }

    _setUserData = pinCode => {
        setUserDataWithPinCode(pinCode).then(() => {});
    };

    _setPinCode = pinCode => {
        // TODO: If check for confirm
        this._setUserData(pinCode);
    };

    render() {
        return <PinCodeScreen setPinCode={this._setPinCode} />;
    }
}

export default PinCodeContainer;
