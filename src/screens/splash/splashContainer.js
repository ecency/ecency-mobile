import React from "react";

import { goToAuthScreens, goToNoAuthScreens } from "../../navigation";

import { getAuthStatus } from "../../realm/realm";

import SplashScreen from "./splashScreen";

class SplashContainer extends React.Component {
    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        await getAuthStatus()
            .then(result => {
                if (result === true) {
                    goToAuthScreens();
                } else {
                    goToNoAuthScreens();
                }
            })
            .catch(error => {
                console.log(error);
                goToAuthScreens();
            });
    }

    render() {
        return <SplashScreen />;
    }
}

export default SplashContainer;
