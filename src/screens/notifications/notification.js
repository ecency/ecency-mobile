import React from "react";
import { StatusBar } from "react-native";
import {
    Container,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
} from "native-base";

class NotificationPage extends React.Component {
    static navigationOptions = {
        title: "Notifications",
    };

    render() {
        return (
            <Container style={{ top: StatusBar.currentHeight }}>
                <Header>
                    <Left>
                        <Button transparent>
                            <Icon name="menu" />
                        </Button>
                    </Left>
                    <Body>
                        <Title>Notifications</Title>
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="search" />
                        </Button>
                        <Button transparent>
                            <Icon name="heart" />
                        </Button>
                        <Button transparent>
                            <Icon name="more" />
                        </Button>
                    </Right>
                </Header>
            </Container>
        );
    }
}
export default NotificationPage;
