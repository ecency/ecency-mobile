import React, { Component } from 'react';
import { AsyncStorage, View } from 'react-native';
import { Content, Card, CardItem, Form, Item, Input, Label, Button, Text, Switch, Left, Right } from 'native-base';

import { LoginWithMasterKey, LoginWithPostingKey } from '../../providers/steem/Auth'
import { getAccount } from '../../providers/steem/Dsteem'

class LoginPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      master_key: '',
      posting_key: '',
      advanced: false
    }
  }
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Login',
    };
  }
  doLogin = async () => {
    let publicWif;
    let privateWif;
    let masterWif;
    let username;

    try {
      await getAccount(this.state.username).then((result) => {

        publicWif = result[0].posting.key_auths[0][0];
        privateWif = this.state.posting_key;
        masterWif = this.state.master_key;
        username = this.state.username;

      }).catch((err) => {
        console.log(err);
        alert(err)
        alert('Username is not valid!');
      });
      
      if (this.state.advanced) {
        if (LoginWithPostingKey(publicWif, privateWif)) {
          let authObject = {
            'username': username,
            'posting_key': privateWif
          }
          AsyncStorage.setItem('isLoggedIn', 'true', () => {
            AsyncStorage.setItem('user', JSON.stringify(authObject), () => {
              this.props.navigation.navigate('LoggedIn');
            })
          });
        }

      } else {
        if (LoginWithMasterKey(username, publicWif, masterWif)) {
          let authObject = {
            'username': username,
            'master_key': masterWif,
          }
          AsyncStorage.setItem('isLoggedIn', 'true', () => {
            AsyncStorage.setItem('user', JSON.stringify(authObject), () => {
              this.props.navigation.navigate('LoggedIn');
            })
          });
        }
      }

    } catch (error) {
      alert(error)
    }
  };

  render() {
    
    return (
      <Content>
        <View style={{ padding: 20 }}>
          <Card>
          <Form>
            <Item floatingLabel>
              <Label>Username</Label>
              <Input autoCapitalize = 'none' onChangeText={(text) => this.setState({username: text})} value={this.state.username}/>
            </Item>
            { this.state.advanced === true ? (
              <View>
              <Item floatingLabel>
                <Label>Private Posting Key</Label>
                <Input secureTextEntry={true} onChangeText={(text) => this.setState({posting_key: text})} value={this.state.posting_key} />
              </Item>
            </View>
            ) : (
              <Item floatingLabel>
                <Label>Master/ Main Password</Label>
                <Input secureTextEntry={true} onChangeText={(text) => this.setState({master_key: text})} value={this.state.master_key}/>
              </Item>
            ) }
            <CardItem>
              <Left>
                <Text>Advanced</Text>
              </Left>
              <Right>
                <Switch value={this.state.advanced} 
                  onValueChange={(value) => { this.setState({ advanced: value }) }}
                />
              </Right>
            </CardItem>
            <Button style={{ alignSelf: 'center', margin: 5 }} 
            block info onPress={() => { this.doLogin() }}>
              <Text>Sign In</Text>
            </Button>    
          </Form>
          </Card>
        </View>
      </Content>
    )
  }
}
export default LoginPage;