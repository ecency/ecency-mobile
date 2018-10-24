import React, { Component } from 'react';

// Components
import { ProfileScreen } from '..';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  //  const result = getUserDataWithUsername(data.username);

  componentWillMount() {
    // alert(this.props.navigation.getParam());
    console.log(this.props.navigation.state.params);
  }

  render() {
    return <ProfileScreen {...this.props} />;
  }
}

export default ProfileContainer;
