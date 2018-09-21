import React from "react";
import { Text, View } from "react-native";

import { goToAuthScreens, goToNoAuthScreens } from "../../navigation";

import SplashScreen from "./splashScreen";
import { getAuthStatus } from "../../realm/realm";

class SplashContainer extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidMount() {
		getAuthStatus().then(result => {
			if(result === true) {
				goToAuthScreens();
			} else {
				goToNoAuthScreens();
			}
		}).catch(error => {
			console.log(error);
			goToAuthScreens();
		});
	}

	render() {
		return <SplashScreen />;
	}
}

export default SplashContainer;
