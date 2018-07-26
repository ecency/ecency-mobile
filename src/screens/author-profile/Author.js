import * as React from 'react';
import { Container, Header, Left, Body, Right, Button, Icon, Title, Content, Text } from 'native-base';
import { getAccount } from '../../providers/steem/Dsteem';

class AuthorPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      author: 'author'
    }
  }

  componentDidMount() {
    getAccount(this.props.navigation.state.params.author).then((author) => {
      this.setState({
        author: author[0]
      })
    }).catch((err) => {
      
    });
  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent
              onPress={() => this.props.navigation.goBack()}>
              <Icon name='arrow-back' />
            </Button>
          </Left>
          <Body>
            <Title> { this.state.author.name } </Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='heart' />
            </Button>
            <Button transparent>
              <Icon name='more' />
            </Button>
          </Right>
        </Header>

        <Content>
          <Text>
            { JSON.stringify(this.state.author) }
          </Text>
        </Content>
      </Container>
    )
  }
}

export default AuthorPage;