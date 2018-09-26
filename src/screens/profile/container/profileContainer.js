import React, { Component } from "react";

// Components
import { ProfileScreen } from "../";

class ProfileContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return <ProfileScreen {...this.props} />;
    }
}

export default ProfileContainer;
