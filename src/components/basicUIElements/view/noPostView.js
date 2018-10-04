import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import NO_POST from "../../../assets/no_post.png";
import styles from "./noPostStyles";

const NoPost = ({ text, name }) => (
  <View style={styles.wrapper}>
    <Image style={styles.image} source={NO_POST} />
    <Text style={styles.text}>{"@" + name + " " + text}</Text>
  </View>
);

export default NoPost;
