import * as React from 'react';
import {  StatusBar} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Text } from 'native-base';

class ProfilePage extends React.Component {
  static navigationOptions = {
    title: 'Profile',
  };

  render() {
    return (
      <Container style={{ flex: 1, top: StatusBar.currentHeight }}>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Profile</Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='search' />
            </Button>
            <Button transparent>
              <Icon name='heart' />
            </Button>
            <Button transparent>
              <Icon name='more' />
            </Button>
          </Right>
        </Header>
        <Text>Profile</Text>
      </Container>
    )
  }
}

export default ProfilePage;