import React from "react";
import { StatusBar } from "react-native";
import { Container, Text } from "native-base";

class NotificationPage extends React.Component {
    static navigationOptions = {
        title: "Notifications",
    };

    render() {
        return (
            <Container>
                <Text>Notifications</Text>
            </Container>
        );
    }
}
export default NotificationPage;
