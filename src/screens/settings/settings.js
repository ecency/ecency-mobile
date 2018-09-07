/* eslint-disable no-unused-vars */
import React from "react";
import { View, Text, BackHandler, AsyncStorage, Picker } from "react-native";
import { Navigation } from "react-native-navigation";
/* eslint-enable no-unused-vars */

class ProfilePage extends React.Component {
    static get options() {
        return {
            _statusBar: {
                visible: true,
                drawBehind: false,
            },
            topBar: {
                animate: true,
                hideOnScroll: false,
                drawBehind: false,
                leftButtons: {},
            },
            layout: {
                backgroundColor: "#f5fcff",
            },
            bottomTabs: {
                visible: false,
                drawBehind: true,
            },
        };
    }

    constructor() {
        super();
        this.saveServer = this.saveServer.bind(this);
        this.state = {
            server: "",
            clients: [],
        };
    }

    async componentWillMount() {
        let clients = await fetch(
            "https://storage.googleapis.com/esteem/public_nodes.json"
        );
        let clientsJson = await clients.json();
        console.log(clientsJson.steemd);
        this.setState({
            clients: clientsJson.steemd,
        });

        let server = await AsyncStorage.getItem("server");
        if (server === null || server === undefined || server === "") {
            this.setState({
                server: "https://api.steemit.com",
            });
        } else {
            this.setState({
                server,
            });
        }

        BackHandler.addEventListener("hardwareBackPress", () => {
            Navigation.pop(this.props.componentId);
            return true;
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress");
    }

    navigationButtonPressed({ buttonId }) {
        console.log(buttonId);

        if (buttonId === "back") {
            Navigation.pop(this.props.componentId);
        }
    }

    saveServer = async server => {
        try {
            await AsyncStorage.setItem("server", server);
            this.setState({
                server,
            });
        } catch (error) {
            console.log(error);
        }
    };

    render() {
        return (
            <View>
                <Text>Settings</Text>

                <Picker
                    selectedValue={this.state.server}
                    style={{ height: 50, width: 250 }}
                    onValueChange={(itemValue, itemIndex) =>
                        this.saveServer(itemValue)
                    }
                >
                    {this.state.clients.map(client => {
                        return <Picker.Item value={client} label={client} />;
                    })}
                </Picker>
            </View>
        );
    }
}

export default ProfilePage;
