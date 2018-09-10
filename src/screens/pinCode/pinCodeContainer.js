import React from "react";
import { AsyncStorage } from "react-native";

import PinCodeScreen from "./pinCodeScreen";

import { default as INITIAL } from "../../constants/initial";

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

    // componentDidMount() {
    // 	this._getDataFromStorage();
    // }

    render() {
        return <PinCodeScreen />;
    }
}

export default PinCodeContainer;
