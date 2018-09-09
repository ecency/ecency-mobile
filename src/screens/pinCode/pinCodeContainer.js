import React from "react";
import { Text, View } from "react-native";

import PinCodeScreen from "./pinCodeScreen";

class PinCodeContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <PinCodeScreen />;
    }
}

export default PinCodeContainer;
