import React, { Component } from 'react';
import { AsyncStorage, View, Button } from 'react-native';
import { Content, Card,Form, Item, Input, Label } from 'native-base';

class LoginPage extends Component {
  constructor(props) {
    super(props);
  }
  static navigationOptions = {
    title: 'Login',
  };

  
  async doLogin() {
    try {
      AsyncStorage.setItem('isLoggedIn', 'true');
      this.props.navigation.navigate('LoggedIn');
    } catch (error) {
      alert(error)
    }
  }

  render() {
    
    return (
      <Content>
        <View style={{ paddingVertical: 20 }}>
          <Card>
          <Form>
            <Item floatingLabel>
              <Label>Email</Label>
              <Input />
            </Item>
            <Item floatingLabel>
              <Label>Password</Label>
              <Input />
            </Item>
            <Button
              buttonStyle={{ marginTop: 20 }}
              backgroundColor="#03A9F4"
              title="SIGN IN"
              onPress={() => {
                this.doLogin().then(() => this.doLogin());
              }}
            />        
          </Form>
          </Card>
        </View>
      </Content>
    )
  }
}
export default LoginPage;