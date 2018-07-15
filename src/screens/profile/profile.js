import * as React from 'react';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Text } from 'native-base';

class ProfilePage extends React.Component {
  static navigationOptions = {
    title: 'Profile',
  };

  render() {
    return (
      <Container>
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
        <Text>tesrsf</Text>
      </Container>
    )
  }
}
export default ProfilePage;