import React from "react";
import { Text, TouchableOpacity, Animated, View } from "react-native";
import { Container } from "native-base";

import { Logo, NumericKeyboard, PinAnimatedInput } from "../../../components";

import styles from "./pinCodeStyles";

class PinCodeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      pin: "",
    };
  }

  // Component Life Cycles

  // Component Functions

  _handleKeyboardOnPress = value => {
    const { setPinCode } = this.props;
    const { pin } = this.state;

    if (value === "clear") {
      this.setState({ pin: "" });
      return;
    }
    const newPin = `${pin}${value}`;

    if (pin.length < 3) {
      this.setState({ pin: newPin });
    } else if (pin.length === 3) {
      this.setState({ pin: newPin });
      setPinCode(`${pin}${value}`)
        .then(() => {
          this.setState({ pin: "" });
        })
        .catch(() => {
          this.setState({ pin: "" });
        });
    } else if (pin.length > 3) {
      this.setState({ pin: `${value}` });
    }
  };

  render() {
    const { informationText, showForgotButton, username } = this.props;
    const { pin } = this.state;

    return (
      <Container style={styles.container}>
        <View style={styles.logoView}>
          <Logo />
        </View>
        <View style={styles.titleView}>
          <Text style={styles.title}>{`@${username}`}</Text>
        </View>
        <View style={styles.informationView}>
          <Text>{informationText}</Text>
        </View>
        <View style={styles.animatedView}>
          <PinAnimatedInput pin={pin} />
        </View>
        <View style={styles.numericKeyboardView}>
          <NumericKeyboard onPress={this._handleKeyboardOnPress} />
        </View>
        {showForgotButton ? (
          <TouchableOpacity style={styles.forgotButtonView}>
            <Text style={styles.forgotButtonText}>Oh, I forgot it…</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.forgotButtonView} />
        )}
      </Container>
    );
  }
}

export default PinCodeScreen;
