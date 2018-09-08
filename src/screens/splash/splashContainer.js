import React from "react";
import { Text, View } from "react-native";

import { goToAuthScreens, goToNoAuthScreens } from "../../navigation";

import SplashScreen from "./splashScreen";

class SplashContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        goToNoAuthScreens();
    }

    render() {
        return <SplashScreen />;
    }
}

export default SplashContainer;
