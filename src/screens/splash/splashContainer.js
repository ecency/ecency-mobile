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
        if (result) {
          goToAuthScreens();
        } else {
          goToNoAuthScreens();
        }
      })
      .catch(() => {
        goToAuthScreens();
      });
  }

  render() {
    return <SplashScreen />;
  }
}

export default SplashContainer;
