import React from 'react';
import { StyleSheet, FlatList, View, AsyncStorage, StatusBar, Dimensions, TouchableHighlight, ActivityIndicator } from 'react-native';
import { Container } from "native-base";

// STEEM        
import { getPosts, getAccount } from '../../providers/steem/Dsteem';

// LIBRARIES
import Placeholder from 'rn-placeholder';

// COMPONENTS
import PostCard from '../../components/PostCard';

// SCREENS
import PostPage from '../../screens/single-post/Post';

class TrendingPage extends React.Component {
  constructor(props) {
    super(props)
    
    this.state = {
      isReady: false,
      posts: [],
      user: [],
      start_author: '',
      start_permlink: '',
      refreshing: false,
      loading: false,
    }
  }

  componentDidMount() {
    this.getTrending();
  }

  getTrending = () => {
    getPosts('trending', { "tag": "", "limit": 5 }).then((result) => {
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

  getMore = () => {
    this.setState({ loading: true })
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

  refreshData = () => {
    this.setState({ 
      refreshing: true
    }, () => {
      this.getTrending();
    });
  }

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          alignContent: 'center',
          alignItems: 'center',
          marginTop: 10,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  render() {
    const navigate = this.props.navigation;
    return (
      <Container style={styles.container}>
      {this.state.isReady ?
          <FlatList
            data={this.state.posts}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) =>
              <View style={styles.card}>
                <TouchableHighlight onPress={() => { navigate('Post',{ content: item }) }}>
                  <PostCard navigate={navigate} content={item}></PostCard>
                </TouchableHighlight>                      
              </View>
            }
            keyExtractor={(post, index) => index.toString()}
            onEndReached={this.getMore}
            refreshing={this.state.refreshing}
            onRefresh={() => this.refreshData()}
            onEndThreshold={0}
            ListFooterComponent={this.renderFooter}
          />
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
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    flex: 1,
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
  }
});

export default TrendingPage;