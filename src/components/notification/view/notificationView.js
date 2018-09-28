import React, { Component } from "react";
import { View, ScrollView, Text, FlatList, Image } from "react-native";
import { LineBreak } from "../../basicUIElements";

// Constants

// Components

// Styles
// eslint-disable-next-line
import styles from "./notificationStyles";

/*
*            Props Name        Description                                     Value
*@props -->  props name here   description here                                Value Type Here
*
*/

class NotificationView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notification: [
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
      ],
    };
  }

  // Component Life Cycles

  // Component Functions

  _getRenderItem = item => {
    return (
      <View style={styles.flatview}>
        <Image
          source={{
            uri: item.avatar,
          }}
          defaultSource={require("../../../assets/no_image.png")}
        />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.name}>{item.title}</Text>
        <Text style={styles.name}>{item.description}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Image
          source={{ uri: item.image }}
          defaultSource={require("../../../assets/no_image.png")}
        />
      </View>
    );
  };

  render() {
    const { notification } = this.state;

    return (
      <View>
        <LineBreak color="#f6f6f6" height={35}>
          <Text>ugur</Text>
        </LineBreak>
        <ScrollView>
          <View>
            <Text>Notification Header</Text>
          </View>
          <FlatList
            data={this.state.notification}
            renderItem={({ item }) => this._getRenderItem(item)}
            keyExtractor={item => item.email}
          />
        </ScrollView>
      </View>
    );
  }
}

export default NotificationView;
