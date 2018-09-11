import React, { Component } from "react";
import { View, Text, WebView } from "react-native";
import { loginWithSC2 } from "../../providers/steem/auth";

export default class SteemConnect extends Component {
	constructor(props) {
		super(props);
		this.state = {
		};
	}
    
	onNavigationStateChange(event){
		console.log(event.url);
		let access_token = event.url.match(/\?(?:access_token)\=([\S\s]*?)\&/)[1];
		console.log(access_token);
		loginWithSC2(access_token);
	}

	render() {
		return (
			<View style={{ flex: 1 }}>
				<WebView 
					onNavigationStateChange={state => this.onNavigationStateChange(state)}
					// TODO: Move it to constants as a object 
					source={{ uri: "https://steemconnect.com/oauth2/authorize?client_id=esteem-app&redirect_uri=http%3A%2F%2F127.0.0.1%3A3415%2F&scope=vote%2Ccomment%2Cdelete_comment%2Ccomment_options%2Ccustom_json%2Cclaim_reward_balance" }}/>
			</View>
		);
	}
}
