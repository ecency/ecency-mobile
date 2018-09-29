import React, { Component } from "react";
import { View, ScrollView, Text, FlatList, Image } from "react-native";
import { LineBreak } from "../../basicUIElements";
import { ContainerHeader } from "../../containerHeader";
// Constants

// Components
import { DropdownButton } from "../../../components/dropdownButton";
import { FilterBar } from "../../../components/filterBar";
// Styles
import styles from "./notificationStyles";

class NotificationView extends Component {
  /* Props
    * ------------------------------------------------
    *   @prop { type }    name                - Description....
    */
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

  _handleOnDropdownSelect = index => {
    console.log("selected index is:" + index);
  };

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
        <FilterBar
          dropdownIconName="md-arrow-dropdown"
          options={[
            "ALL NOTIFICATION",
            "LATEST NOTF",
            "ESTEEMAPP",
            "UGUR ERDAL",
            "ONLY YESTERDAY",
          ]}
          defaultText="ALL NOTIFICATION"
          onDropdownSelect={this._handleOnDropdownSelect}
          rightIconName="ios-checkmark"
        />
        <ScrollView style={styles.scrollView}>
          <ContainerHeader title="Recent" />
          <FlatList
            data={notification}
            renderItem={({ item }) => this._getRenderItem(item)}
            keyExtractor={item => item.email}
          />
          {/* Will remove fallow lines */}
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
