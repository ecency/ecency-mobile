import React, { Component } from 'react';
import { View, TextInput, Text } from 'react-native';

// Constants

// Components
import Icon from "../../icon";

// Styles
// eslint-disable-next-line
import styles from "./searchStyles";

class SearchView extends Component {
	/* Props
		* ------------------------------------------------
		*   @prop { type }    name                - Description....
		*/

	constructor(props) {
		super(props);
		this.state = {};
	}

	// Component Life Cycles

	// Component Functions

	render() {
		return (
			<View style={styles.container}>
				<Icon color="#fff" name="ios-search"></Icon>
				<TextInput></TextInput>
				<Text style={{ color: "white" }}>sadsadahfasjfhkajsdjkhaskfasjkfjasfjlajsfkas</Text>
			</View>
		);
	}
}

export default SearchView;
