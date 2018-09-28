import React from "react";
import { Text, TouchableOpacity, Animated } from "react-native";
import { Container, Content, Icon, Item, Input } from "native-base";

import { Logo, NumericKeyboard } from "../../components";

import styles from "../../styles/pinCode.styles";
import globalStyles from "../../globalStyles";

class PinCodeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showPassword: false,
      pin: "",
    };
  }

  _handleOnChangeInput = text => {
    const { setPinCode } = this.props;
    if (text.length === 4) {
      setPinCode(text);
      this.setState({ pin: "" });
    } else {
      this.setState({ pin: text });
    }
  };

  render() {
    const test = new Animated.Value(0);
    const tilt = test.interpolate({
      inputRange: [0, 0.3, 0.6, 0.9],
      outputRange: [0, -50, 50, 0],
    });
    const pass = [0, 1];
    return (
      <Container style={globalStyles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Enter Pin Code</Text>
        <Animated.View
          style={{
            transform: [{ translateX: tilt }],
            flexDirection: "row",
            alignSelf: "center",
          }}
        >
          {[...Array(4)].map((val, index) => {
            if (pass[index] === undefined) {
              return (
                <Animated.View
                  key={"passwordItem-" + index}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 20,
                    margin: 5,
                    width: 20,
                    borderRadius: 20 / 2,
                    borderWidth: 1,
                    borderColor: "#357ce6",
                    backgroundColor: "#fff",
                  }}
                />
              );
            } else {
              return (
                <Animated.View
                  key={"passwordItem-" + index}
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    height: 20,
                    margin: 5,
                    width: 20,
                    borderRadius: 20 / 2,
                    borderWidth: 1,
                    borderColor: "#357ce6",
                    backgroundColor: "#357ce6",
                  }}
                />
              );
            }
          })}
        </Animated.View>
        <NumericKeyboard />
        <TouchableOpacity>
          <Text style={styles.forgotButtonText}>Oh, I forgot it…</Text>
        </TouchableOpacity>

        <Text style={styles.forgotButtonText}>
          {this.props.informationText}
        </Text>
      </Container>
    );
  }
}

export default PinCodeScreen;
