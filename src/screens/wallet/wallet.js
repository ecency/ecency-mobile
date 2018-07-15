import * as React from 'react';
import { Container, Header, Left, Body, Right, Button, Icon, Title } from 'native-base';

class WalletPage extends React.Component {
  static navigationOptions = {
    title: 'Wallet',
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
            <Title>Wallet</Title>
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
      </Container>
    )
  }
}
export default WalletPage;