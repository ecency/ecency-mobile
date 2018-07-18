import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Container, Content, Header, Left, Body, Right, Button, Icon, Title } from 'native-base';
import HTMLView from 'react-native-htmlview';
import HTML from 'react-native-render-html';

class SinglePostPage extends React.Component {
  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Container>
        <Header>
          <Left>
            <Button transparent onPress={() => this.props.navigation.goBack()}>
              <Icon name='arrow-back' />
            </Button>
          </Left>
          <Body>
            <Title></Title>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='bookmark' />
            </Button>
            <Button transparent>
              <Icon name='more' />
            </Button>
          </Right>
        </Header>
        <Content>
          <HTML html={this.props.navigation.state.params.content.body} imagesMaxWidth={Dimensions.get('window').width} />
        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontSize: 32
  }
})

export default SinglePostPage;

