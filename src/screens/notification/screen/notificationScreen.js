import React from "react";
import { Container, Text } from "native-base";

// Styles
//import styles from "./notificationStyles";

class NotificationScreen extends React.Component {
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
export default NotificationScreen;
