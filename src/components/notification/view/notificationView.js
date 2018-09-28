import React, { Component } from "react";
import { View, ScrollView, Text, FlatList, Image } from "react-native";
import { LineBreak } from "../../basicUIElements";
import { ContainerHeader } from "../../containerHeader";
import Ionicons from "react-native-vector-icons/Ionicons";

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
      // NOTE: DOMI DATA! them gonna remove!
      notification: [
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Featuressasasaasasas",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
          isNew: true,
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
          isNew: true,
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          description: "My own Top 5 eSteem Surfer Features",
          image: "https://steemitimages.com/u/feruz/avatar/small",
          date: "yesterday",
        },
        {
          name: "esteemapp",
          title: "25% likes your post:",
          avatar: "https://steemitimages.com/u/feruz/avatar/small",
          description: "My own Top 5 eSteem Surfer Featuresasassasasaasas",
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
      <View
        style={[
          styles.notificationWrapper,
          item.isNew && styles.isNewNotification,
        ]}
      >
        <Image
          style={[styles.avatar, !item.avatar && styles.hasNoAvatar]}
          source={{
            uri: item.avatar,
          }}
        />
        <View style={styles.body}>
          <View style={styles.titleWrapper}>
            <Text style={styles.name}>{item.name} </Text>
            <Text style={styles.title}>{item.title}</Text>
          </View>
          <Text numberOfLines={1} style={styles.description}>
            {item.description}
          </Text>
        </View>
        {item.image && (
          <Image
            style={styles.image}
            source={{ uri: item.image }}
            defaultSource={require("../../../assets/no_image.png")}
          />
        )}
      </View>
    );
  };

  render() {
    const { notification } = this.state;

    return (
      <View style={styles.container}>
        <LineBreak color="#f6f6f6" height={35}>
          <View styles={styles.lineBreakItem}>
            <Text style={styles.lineBreakItemText}>
              {/* TODO: I guess these will be dropdown there for it should be a component  */}
              ALL NOTIFICATION
              {/* <Ionicons style={styles.arrowIcon} name="md-arrow-dropdown" /> */}
            </Text>
          </View>
        </LineBreak>
        <ScrollView style={styles.scrollView}>
          <ContainerHeader title="Recent" />
          <FlatList
            data={notification}
            renderItem={({ item }) => this._getRenderItem(item)}
            keyExtractor={item => item.email}
          />
          <ContainerHeader title="Yesterday" />
          <FlatList
            data={notification}
            renderItem={({ item }) => this._getRenderItem(item)}
            keyExtractor={item => item.email}
          />
        </ScrollView>
      </View>
    );
  }
}

export default NotificationView;
