import React from "react";
import { AsyncStorage } from "react-native";
import { connect } from "react-redux";
import { Navigation } from "react-native-navigation";

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
          informationText: "Enter pin to unlock",
        });
      } else {
        this.setState({
          informationText: "Set new pin",
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
    const {
      currentAccount: { password, name },
      componentId,
    } = this.props;
    const { isExistUser, pinCode } = this.state;
    if (isExistUser) {
      // If the user is exist, we are just checking to pin and navigating to home screen
      const pinData = {
        pinCode: pin,
        password,
        username: name,
      };
      verifyPinCode(pinData)
        .then(() => {
          Navigation.setStackRoot(componentId, {
            component: {
              name: "navigation.eSteem.Home",
            },
          });
        })
        .catch(err => {
          alert(err);
        });
    } else {
      // If the user is logging in for the first time, the user should set to pin
      if (!pinCode) {
        this.setState({
          informationText: "Write again",
          pinCode: pin,
        });
      } else {
        if (pinCode === pin) {
          const pinData = {
            pinCode: pin,
            password,
            username: name,
          };
          setUserDataWithPinCode(pinData).then(() => {
            AsyncStorage.setItem(
              INITIAL.IS_EXIST_USER,
              JSON.stringify(true),
              () => {
                Navigation.setStackRoot(componentId, {
                  component: {
                    name: "navigation.eSteem.Home",
                  },
                });
              }
            );
          });
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
    const { informationText, isExistUser } = this.state;
    return (
      <PinCodeScreen
        informationText={informationText}
        setPinCode={this._setPinCode}
        showForgotButton={isExistUser}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.data.accounts.find(
    item => item.id === state.account.data.currentAccountId
  ),
});

export default connect(mapStateToProps)(PinCodeContainer);
