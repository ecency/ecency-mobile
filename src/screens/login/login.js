import React, { Component } from "react";
import {
    View,
    ActivityIndicator,
    Text,
    StyleSheet,
    Image,
    StatusBar,
} from "react-native";
import {
    Item,
    Header,
    Input,
    Card,
    Button,
    Container,
    Icon,
    Left,
    Right,
    Body,
    Label,
    Thumbnail,
} from "native-base";

import { Login } from "../../providers/steem/auth";
import { start } from "../../app";
import RNRestart from "react-native-restart";

class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            isLoading: false,
        };
    }

    doLogin = () => {
        this.setState({ isLoading: true });

        let password = this.state.password;
        let username = this.state.username;

        Login(username, password)
            .then(result => {
                if (result === true) {
                    RNRestart.Restart();
                }
            })
            .catch(err => {
                alert(err);
                this.setState({ isLoading: false });
            });
    };

    render() {
        return (
            <Container style={styles.container}>
                <Header style={{ backgroundColor: "white", height: 80 }}>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.toggleDrawer()}
                        >
                            <Thumbnail
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 16,
                                    margin: 10,
                                }}
                                source={require("../../assets/esteem.jpg")}
                            />
                        </Button>
                    </Left>
                    <Body />
                    <Right>
                        <Text
                            style={{
                                color: "#a7adaf",
                                marginHorizontal: 20,
                                fontWeight: "bold",
                            }}
                        >
                            Sign Up
                        </Text>
                    </Right>
                </Header>
                <View style={styles.header}>
                    <View
                        style={{
                            flex: 0.5,
                            alignItems: "center",
                            paddingLeft: 10,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 40,
                                fontWeight: "600",
                                color: "#626262",
                                marginTop: 35,
                            }}
                        >
                            Sign in
                        </Text>
                        <Text style={{ color: "#a7adaf", marginTop: 20 }}>
                            with your username {"\n"} and password {"\n"} to get
                            all the {"\n"}{" "}
                            <Text
                                style={{ fontWeight: "bold", color: "#a7adaf" }}
                            >
                                benefits of eSteem
                            </Text>{" "}
                        </Text>
                    </View>
                    <View style={{ flex: 0.5, overflow: "hidden", padding: 0 }}>
                        <Image
                            style={{
                                width: 220,
                                height: 304,
                                marginTop: 10,
                                marginLeft: 20,
                            }}
                            source={require("../../assets/love_mascot.png")}
                        />
                    </View>
                </View>

                <View
                    style={{ padding: 30, backgroundColor: "white", flex: 0.4 }}
                >
                    <View>
                        <Item
                            rounded
                            style={{
                                margin: 5,
                                backgroundColor: "#f6f6f6",
                                height: 40,
                                marginVertical: 10,
                                overflow: "hidden",
                                borderColor: "white",
                            }}
                        >
                            <Icon
                                name="at"
                                style={{
                                    backgroundColor: "#ececec",
                                    height: 40,
                                    width: 40,
                                    alignItems: "center",
                                    padding: 8,
                                    color: "#a7adaf",
                                    fontWeight: "bold",
                                }}
                            />
                            <Input
                                autoCapitalize="none"
                                placeholder="username"
                                onChangeText={text =>
                                    this.setState({ username: text })
                                }
                                value={this.state.username}
                            />
                        </Item>

                        <Item
                            rounded
                            style={{
                                margin: 5,
                                backgroundColor: "#f6f6f6",
                                height: 40,
                                marginVertical: 10,
                                overflow: "hidden",
                                borderColor: "white",
                            }}
                        >
                            <Icon
                                name="md-lock"
                                style={{
                                    backgroundColor: "#ececec",
                                    height: 40,
                                    width: 40,
                                    alignItems: "center",
                                    paddingVertical: 7,
                                    paddingLeft: 13,
                                    color: "#a7adaf",
                                    fontWeight: "bold",
                                }}
                            />
                            <Input
                                secureTextEntry={true}
                                placeholder="Password or WIF"
                                onChangeText={text =>
                                    this.setState({ password: text })
                                }
                                value={this.state.password}
                            />
                        </Item>
                        <View />
                    </View>
                    <View
                        style={{
                            borderBottomColor: "lightgray",
                            borderBottomWidth: 0.7,
                            marginVertical: 20,
                        }}
                    />
                    <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                    >
                        <Icon
                            name="information-circle"
                            style={{
                                flex: 0.15,
                                color: "#a7adaf",
                                fontSize: 25,
                                paddingLeft: 10,
                            }}
                        />
                        <Text style={{ flex: 0.85, color: "#a7adaf" }}>
                            Don't worry! {"\n"}
                            Your password is kept locally on your device and
                            removed upon logout!
                        </Text>
                    </View>
                </View>

                <View style={styles.footer}>
                    <View style={{ flex: 0.6, alignItems: "flex-end" }}>
                        <Text
                            onPress={() => {
                                this.props.navigation.goBack();
                            }}
                            style={{
                                color: "#a7adaf",
                                fontSize: 18,
                                margin: 25,
                            }}
                        >
                            Skip this screen
                        </Text>
                    </View>
                    <View style={{ flex: 0.4, alignItems: "center" }}>
                        {this.state.isLoading ? (
                            <Button
                                style={{
                                    borderRadius: 25,
                                    padding: 5,
                                    backgroundColor: "#007EE5",
                                    width: 130,
                                    height: 35,
                                    marginTop: 20,
                                }}
                            >
                                <ActivityIndicator
                                    color="white"
                                    style={{ marginHorizontal: 50 }}
                                />
                            </Button>
                        ) : (
                            <Button
                                style={{
                                    borderRadius: 25,
                                    padding: 5,
                                    backgroundColor: "#007EE5",
                                    width: 130,
                                    height: 35,
                                    marginTop: 20,
                                }}
                                onPress={() => {
                                    this.doLogin();
                                }}
                            >
                                <Text
                                    style={{
                                        color: "white",
                                        fontWeight: "bold",
                                        marginHorizontal: 40,
                                    }}
                                >
                                    Login
                                </Text>
                            </Button>
                        )}
                    </View>
                </View>
            </Container>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        margin: 0,
        padding: 0,
        backgroundColor: "#f1f1f1",
        flexDirection: "column",
    },
    header: {
        flexDirection: "row",
        padding: 0,
        backgroundColor: "white",
        marginVertical: 10,
        height: 200,
        flex: 0.4,
    },
    footer: {
        flex: 0.2,
        bottom: 0,
        marginTop: 10,
        height: 80,
        backgroundColor: "white",
        flexDirection: "row",
    },
});
export default LoginPage;
