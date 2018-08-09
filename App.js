/* eslint-disable no-unused-vars */
import React from "react";
import Navigation from "./src/navigation/Drawer";
import { Provider } from "react-redux";
import store from "./src/redux/store/Store";
/* eslint-enable no-unused-vars */

export default class App extends React.Component {
	constructor(props) {
		super(props);
	}
    
	render() {
		return (
			<Provider store={store}>
				<Navigation />
			</Provider>
		);
	}
}