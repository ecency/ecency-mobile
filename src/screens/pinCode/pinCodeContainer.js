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
            console.log("============isExistUser===========", isExistUser);
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

        console.log(
            "==============password==========",
            this.props.currentAccount.password
        );
    }

    _getDataFromStorage = () =>
        new Promise(resolve => {
            AsyncStorage.getItem(INITIAL.IS_EXIST_USER, (err, result) => {
                console.log("============IS_EXIST_USER===========", result);
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
            currentAccount: { password },
            componentId,
        } = this.props;
        const { isExistUser, pinCode } = this.state;
        console.log(password);
        if (isExistUser) {
            // If the user is exist, we are just checking to pin and navigating to home screen
            verifyPinCode(pin, password)
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
                    informationText: "write again",
                    pinCode: pin,
                });
            } else {
                if (pinCode === pin) {
                    setUserDataWithPinCode(pinCode, password).then(() => {
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
        const { informationText } = this.state;
        return (
            <PinCodeScreen
                informationText={informationText}
                setPinCode={this._setPinCode}
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
