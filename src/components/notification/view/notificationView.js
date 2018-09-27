import React, { Component } from "react";
import { View, Text, FlatList } from "react-native";
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
      users: [
        {
          name: "Proxima Midnight",
          email: "proxima@appdividend.com",
        },
        {
          name: "Ebony Maw",
          email: "ebony@appdividend.com",
        },
        {
          name: "Black Dwarf",
          email: "dwarf@appdividend.com",
        },
        {
          name: "Mad Titan",
          email: "thanos@appdividend.com",
        },
        {
          name: "Supergiant",
          email: "supergiant@appdividend.com",
        },
        {
          name: "Loki",
          email: "loki@appdividend.com",
        },
        {
          name: "corvus",
          email: "corvus@appdividend.com",
        },
        {
          name: "Proxima Midnight",
          email: "proxima1@appdividend.com",
        },
        {
          name: "Ebony Maw",
          email: "ebony1@appdividend.com",
        },
        {
          name: "Black Dwarf",
          email: "dwarf1@appdividend.com",
        },
        {
          name: "Mad Titan",
          email: "thanos1@appdividend.com",
        },
        {
          name: "Supergiant",
          email: "supergiant1@appdividend.com",
        },
        {
          name: "Loki",
          email: "loki1@appdividend.com",
        },
        {
          name: "corvus",
          email: "corvus1@appdividend.com",
        },
      ],
    };
  }

  // Component Life Cycles

  // Component Functions

  render() {
    // eslint-disable-next-line
    // const {} = this.props;
    // eslint-disable-next-line
    console.log(this.state.users);
    console.log("asdasd");
    return (
      <View>
        <LineBreak color="#f6f6f6" height={35}>
          <Text>ugur</Text>
        </LineBreak>
        <View style={styles.container}>
          <Text style={styles.h2text}>Black Order</Text>
          <FlatList
            data={this.state.users}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.flatview}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            )}
            keyExtractor={item => item.email}
          />
        </View>
      </View>
    );
  }
}

export default NotificationView;
