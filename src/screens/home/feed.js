import React, { Component } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Container, Header, Title, Button, 
         Thumbnail, Left, Right, Body, Text,
         Tabs, Tab, Content, Icon, Card, 
         CardItem, Image } from "native-base";

// DSTEEM        
import { getPosts } from '../../providers/steem/Dsteem';

// LIBRARIES
import Placeholder from 'rn-placeholder';

// COMPONENTS
// import PostCard from '../../components/PostCard';

class PostCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: this.props.post
    }
  }
  componentDidMount() {
    alert(this.props.post);
  }
  render() {
    return (
      <Container>
      <Card>
        <CardItem>
          <Left>
            <Body>
              <Text>{ this.props.post }</Text>
              <Text note>April 15, 2016</Text>
            </Body>
          </Left>
        </CardItem>
      </Card>
    </Container> 
    );
  }
}

class FeedPage extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isReady: false,
      posts: []
    }
  }

  componentDidMount() {
    this.getTrending();
  }

  getTrending = () => {
    getPosts('trending', { "tag": "", "limit": 3 }).then((result) => {
      this.setState({ isReady: true });
      this.setState({ posts: result });
      console.log(this.state.posts)
    }).catch((err) => {
      alert(err);
    });
  }

  render() {
    return (
      <Container>
        <Header transparent>
          <Left>
            <Button transparent onPress={() => this.props.navigation.toggleDrawer()}>
              <Thumbnail small source={{uri: 'https://steemitimages.com/u/esteemapp/avatar/small'}} />
            </Button>
          </Left>
          <Body>
            <Title></Title>
          </Body>
          <Right>
            
          </Right>
        </Header>
        <Tabs>
          <Tab heading="Feed" 
          tabStyle={{backgroundColor: 'white'}} 
          textStyle={{fontWeight: 'bold'}} 
          activeTabStyle={{backgroundColor: 'white'}} 
          activeTextStyle={{fontWeight: 'bold'}}>
          </Tab>
          <Tab heading="Hot" 
          tabStyle={{backgroundColor: 'white'}} 
          textStyle={{fontWeight: 'bold'}} 
          activeTabStyle={{backgroundColor: 'white'}} 
          activeTextStyle={{fontWeight: 'bold'}}>
            <Text>Hot</Text>
          </Tab>
          <Tab heading="Trending" 
          tabStyle={{backgroundColor: 'white'}} 
          textStyle={{fontWeight: 'bold'}} 
          activeTabStyle={{backgroundColor: 'white'}} 
          activeTextStyle={{fontWeight: 'bold'}}>
            <Container style={styles.container}>
              {this.state.isReady ? 
                <FlatList
                    data={this.state.posts}
                    showsVerticalScrollIndicator={false}
                    renderItem={({post}) =>
                    <View>
                      <PostCard post={post}/>
                    </View>
                    }
                    keyExtractor={(post, index) => index.toString()}
                  /> : 
                <View>
                  <View style={styles.placeholder} >
                    <Placeholder.ImageContent
                      size={60}
                      animate="fade"
                      lineNumber={4}
                      lineSpacing={5}
                      lastLineWidth="30%"
                      onReady={this.state.isReady}
                    ></Placeholder.ImageContent>
                  </View>
                  <View style={styles.placeholder} >
                    <Placeholder.ImageContent
                      size={60}
                      animate="fade"
                      lineNumber={4}
                      lineSpacing={5}
                      lastLineWidth="30%"
                      onReady={this.state.isReady}
                    ></Placeholder.ImageContent>
                  </View>
                  <View style={styles.placeholder} >
                    <Placeholder.ImageContent
                      size={60}
                      animate="fade"
                      lineNumber={4}
                      lineSpacing={5}
                      lastLineWidth="30%"
                      onReady={this.state.isReady}
                    ></Placeholder.ImageContent>
                  </View>  
                </View>    
              }
            </Container>
          </Tab>
        </Tabs>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9'
  },
  placeholder: {
    backgroundColor: 'white',
    padding: 20,
    borderStyle: 'solid',
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 10,
    marginRight: 10,
    marginLeft: 10,
    marginTop: 10,
  },
  card: {

  }
});

export default FeedPage;