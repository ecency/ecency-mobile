import React, { Component } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Item, Label, Input, Card, Button, Container, Icon } from 'native-base';

import { Login } from '../../providers/steem/Auth';

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      isLoading: false 
    }
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Login',
    };
  }

  doLogin = () => {
    this.setState({ isLoading: true });
    
    let password = this.state.password;
    let username = this.state.username;

    Login(username, password).then((result) => {

      if (result === true) {
        this.props.navigation.navigate('LoggedIn');
      }
      
    }).catch((err) => {
      alert(err)
      this.setState({ isLoading: false });
    });
  }

  render() {
    
    return (
      <Container style={styles.container}>
        <Card style={styles.header}>
          <Text>
            Header
          </Text>
        </Card>

          <Card style={{ padding: 20 }}>
            <View>
              <Item rounded style={{ margin: 5 }}>
                <Icon name='at'/> 
                <Input autoCapitalize='none' placeholder='username' onChangeText={(text) => this.setState({username: text})} value={this.state.username}/>
              </Item>
              
              <Item rounded style={{ margin: 5 }}>
                <Icon name='md-lock'/> 
                <Input secureTextEntry={true} placeholder='Password or WIF' onChangeText={(text) => this.setState({password: text})} value={this.state.password}/>
              </Item>
              <View>
                { this.state.isLoading ? (
                  <Button block light>
                    <ActivityIndicator/>
                  </Button>
                ) : (
                  <Button block info
                      onPress={() => { this.doLogin() }}>
                    <Text>Sign In</Text>
                  </Button>
                )}
              </View>
            </View>
            <View style={{ borderBottomColor: 'lightgray', borderBottomWidth: 1, marginVertical: 20 }}/>
            <View style={{ flexDirection: 'row' }}>
              <Icon name='information-circle' style={{ flex: 0.2 }}/> 
              <Text style={{ flex: 0.8 }}>
                Don't worry!
                Your password is kept locally on your device and removed upon logout!
              </Text>
            </View>
          </Card>

        <Card style={styles.footer}>
          <Text>
            Footer
          </Text>
        </Card>
      </Container>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    margin: 0,
    padding: 0,
    backgroundColor: '#f1f1f1',
  },
  header: {
    flex: 1,
    padding: 5
  },
  footer: {
    bottom: 0,
    flex: 1
  }
});
export default LoginPage;