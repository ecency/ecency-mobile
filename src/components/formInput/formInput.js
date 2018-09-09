import React from "react";
import { View, TextInput } from "react-native";

import styles from "../../styles/formInput.styles";

const FormInput = props => (
    <View style={styles.container}>
        <TextInput style={styles.input} {...props} />
    </View>
);

export default FormInput;
