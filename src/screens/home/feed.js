import React, { Component } from 'react';
import { StyleSheet, FlatList, View, Image, StatusBar, Dimensions, TouchableHighlight } from 'react-native';
import { Font } from "expo";
import { Container, Header, Title, Button, 
         Thumbnail, Left, Right, Body, Text,
         Tabs, Tab, Content, Icon, Card, 
         CardItem, Spinner, ScrollableTab } from "native-base";

// STEEM        
import { getPosts } from '../../providers/steem/Dsteem';

// LIBRARIES
import Placeholder from 'rn-placeholder';

// COMPONENTS
import { PostCard } from '../../components/PostCard';

// SCREENS
import PostPage from '../../screens/single-post/Post';

class FeedPage extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isReady: false,
      posts: [],
      start_author: '',
      start_permlink: '',
      refreshing: false,
    }
  }

  async componentWillMount() {
    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf")
    });
  }

  componentDidMount() {
    this.getTrending();
  }

  getTrending = () => {
    getPosts('trending', { "tag": "", "limit": 10 }).then((result) => {
      this.setState({ 
        isReady: true,
        posts: result,
        start_author: result[result.length - 1].author,
        start_permlink: result[result.length - 1].permlink,
        refreshing: false
      });
    }).catch((err) => {
      alert(err);
    });
  }

  getMoreTrending = () => {
    getPosts('trending', { "tag": "", "limit": 10, "start_author": this.state.start_author, "start_permlink": this.state.start_permlink }).then((result) => {
      let posts = result;
      posts.shift();
      this.setState({
        posts: [...this.state.posts, ...posts],
        start_author: result[result.length - 1].author,
        start_permlink: result[result.length - 1].permlink
      });
    });
  }

  refreshTrendingPosts = () => {
    this.setState({ 
      refreshing: true
    }, () => {
      this.getTrending();
    });
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Container>
        <StatusBar translucent={true} backgroundColor={'transparent'}/>   
        <Header style={{ backgroundColor: 'white' }}>
          <Left>
            <Button style={{ position: 'relative' }}  transparent onPress={() => this.props.navigation.toggleDrawer()}>
              <Thumbnail square small source={{uri: 'https://steemitimages.com/u/esteemapp/avatar/small'}} />
            </Button>            
          </Left>
        </Header>
        <Tabs style={styles.tabs}
          renderTabBar={() =>
            <ScrollableTab style={{
              width: 300,
              backgroundColor: 'white',
              marginLeft: 50,
              marginHorizontal: Dimensions.get("window").width / 11,
              paddingTop: Dimensions.get("window").width / 35
            }}
              tabsContainerStyle={{ width: 300 }} />}>
        
          <Tab heading="Feed" 
          tabStyle={{ backgroundColor: 'white'}} 
          textStyle={{fontWeight: 'bold'}} 
          activeTabStyle={{ backgroundColor: 'white'}} 
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
                <View>
                  <FlatList
                    data={this.state.posts}
                    showsVerticalScrollIndicator={false}
                    renderItem={({item}) =>
                      <View style={styles.card}>
                        <TouchableHighlight onPress={() => { navigate('Post',{ content: item }) }}>
                          <PostCard content={item}></PostCard>
                        </TouchableHighlight>                      
                      </View>
                    }
                    keyExtractor={(post, index) => index.toString()}
                    onEndReached={this.getMoreTrending}
                    refreshing={this.state.refreshing}
                    onRefresh={() => this.refreshTrendingPosts()}
                    onEndThreshold={0}
                  />
                </View>
                   : 
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
    borderRadius: 0,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  card: {
    backgroundColor: 'white',
    shadowColor: 'white',
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: '#e2e5e8',
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  tabs: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: Dimensions.get("window").width / 26,
  },
});

export default FeedPage;