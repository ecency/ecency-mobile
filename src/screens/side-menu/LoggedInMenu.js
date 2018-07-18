import React, { Component } from "react";
import { Image, AsyncStorage } from "react-native";
import {
  Content,
  Text,
  List,
  ListItem,
  Icon,
  Container,
  Left,
  Right,
  View,
  Badge
} from "native-base";
import styles from "./style";

import { getAccount } from '../../providers/steem/Dsteem'

const drawerCover = require("../../assets/drawer-cover.png");
const drawerImage = require("../../assets/esteem.jpg");
const datas = [
  {
    name: "Home",
    route: "Home",
    icon: "home",
    bg: "#C5F442"
  },
  {
    name: "Profile",
    route: "Profile",
    icon: "contact",
    bg: "#C5F442"
  },
  {
    name: "Wallet",
    route: "Wallet",
    icon: "card",
    bg: "#477EEA",
  },
  {
    name: "Notifications",
    route: "Notifications",
    icon: "notifications",
    bg: "#DA4437",
  },
];

export class LoggedInSideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shadowOffsetWidth: 1,
      shadowRadius: 4,
      user: []
    };
  }

  async componentDidMount() {
    AsyncStorage.getItem('user').then((result) => {
      let res = JSON.parse(result);
      getAccount(res.username).then((result) => {
        this.setState({
          user: result[0]
        })
      }).catch((err) => {
        
      });

    }).catch((err) => {
      
    });
  }

  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <Image source={drawerCover} style={styles.drawerCover} />
          <Image square style={styles.drawerImage} source={drawerImage} />
          <View style={styles.info}>
            <Text style={styles.userLabel}>{ this.state.user.name }</Text>
          </View>
          <List
            dataArray={datas}
            renderRow={data =>
              <ListItem
                button
                noBorder
                onPress={() => this.props.navigation.navigate(data.route)}
              >
                <Left>
                  <Icon
                    active
                    name={data.icon}
                    style={{ color: "#777", fontSize: 26, width: 30 }}
                  />
                  <Text style={styles.text}>
                    {data.name}
                  </Text>
                </Left>
                {data.types &&
                  <Right style={{ flex: 1 }}>
                    <Badge
                      style={{
                        borderRadius: 3,
                        height: 25,
                        width: 72,
                        backgroundColor: data.bg
                      }}
                    >
                      <Text
                        style={styles.badgeText}
                      >{`${data.types} Types`}</Text>
                    </Badge>
                  </Right>}
              </ListItem>}
          />
        </Content>
      </Container>
    );
  }
}