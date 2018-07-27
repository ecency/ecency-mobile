import React from 'react';
import { StyleSheet, View, AsyncStorage, StatusBar, Dimensions } from 'react-native';
import { Container, Header, Button, Left,
         Thumbnail, Right, Text, Tabs,
         Tab, Icon, ScrollableTab } from "native-base";

// STEEM        
import { getAccount } from '../../providers/steem/Dsteem';

// SCREENS
import FeedPage from './feed';
import HotPage from './hot';
import TrendingPage from './trending';

class HomePage extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      user: [],
      isLoggedIn: false,
    }
  }

  componentDidMount() {
    AsyncStorage.getItem('isLoggedIn').then((result) => {
      let res = JSON.parse(result);
      if (res) {
        this.setState({
          isLoggedIn: true
        }, () => {
          AsyncStorage.getItem('user').then((result) => {
            let user = JSON.parse(result);
            getAccount(user.username).then((result) => {
              this.setState({
                user: result[0]
              }, () => {
              })
            })
          });
        })
      }
    })
  }

  render() {
    const { navigate } = this.props.navigation;
    return (
      <Container style={{ flex: 1, top: StatusBar.currentHeight }}>
        <StatusBar translucent={true} backgroundColor={'transparent'}/>
        <Header style={{ backgroundColor: 'white' }}>
          <Left>
            <Button style={{ zIndex: 2 }} transparent onPress={() => this.props.navigation.toggleDrawer()}>
              <Thumbnail square small source={{uri: `https://steemitimages.com/u/${this.state.user.name}/avatar/small` }} style={{ width: 30, height: 30, borderRadius: 15 }}/>
            </Button>
          </Left>
          <Right>
            <Button transparent>
              <Icon name='search' />
            </Button>
          </Right>
        </Header>
        <Tabs style={styles.tabs}
          renderTabBar={() =>
            <ScrollableTab style={{
              zIndex: 1,
              width: 220,
              backgroundColor: 'white',
              borderWidth: 0,
              alignSelf: 'center',
            }}
              tabsContainerStyle={{ width: 220 }} />}>
        
          <Tab heading="Feed" 
          tabStyle={{ backgroundColor: 'transparent'}} 
          textStyle={{fontWeight: 'bold'}} 
          activeTabStyle={{ backgroundColor: 'transparent' }} 
          activeTextStyle={{fontWeight: 'bold'}}>
          
          { this.state.isLoggedIn ? (
            <Container style={styles.container}>
              <FeedPage navigation={navigate}/>
            </Container>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Button light
                onPress={() => this.props.navigation.navigate('Login')}
                style={{ alignSelf: 'center', marginTop: 100 }}>
                <Text> 
                Login to setup your custom Feed!
                </Text>
              </Button>
            </View>
          )}
          </Tab>
            <Tab heading="Hot" 
            tabStyle={{backgroundColor: 'transparent'}} 
            textStyle={{fontWeight: 'bold'}} 
            activeTabStyle={{backgroundColor: 'transparent'}} 
            activeTextStyle={{fontWeight: 'bold'}}>
              <HotPage navigation={navigate}/>
            </Tab>
            <Tab heading="Trending" 
            tabStyle={{backgroundColor: 'transparent'}} 
            textStyle={{fontWeight: 'bold'}} 
            activeTabStyle={{backgroundColor: 'transparent'}} 
            activeTextStyle={{fontWeight: 'bold'}}>
              <TrendingPage navigation={navigate}/>
            </Tab>
          </Tabs>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1
  },
  tabs: {
    position: 'absolute',
    top: Dimensions.get("window").width / 30,
    alignItems: 'center',
    flex: 1
  }
});

export default HomePage;