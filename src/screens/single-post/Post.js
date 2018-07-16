import * as React from 'react';
import { Container, Header, Left, Body, Right, Button, Icon, Title } from 'native-base';

class PostPage extends React.Component {
  constructor(props) {
    super(props);

  }
  static navigationOptions = {
    title: 'Welcome',
  };

  componentDidMount() {
    alert(this.props.content)
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>post page</Title>
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
export default PostPage;