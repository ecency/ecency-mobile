import React from "react";
import { View, Image } from "react-native";

import LOGO from "../../assets/esteem.jpg";
import styles from "../../styles/logo.styles";

const Logo = props => (
    <View style={styles.container}>
        <Image
            source={props.source ? props.source : LOGO}
            style={[styles.logo, props.style]}
            resizeMode="contain"
        />
    </View>
);

export default Logo;
