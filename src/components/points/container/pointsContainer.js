import React, { Component } from 'react';
import { connect } from 'react-redux';

// Services and Actions
import { getUser, getUserPoints } from '../../../providers/esteem/ePoint';

// Component
import PointsView from '../view/pointsView';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class PointsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userPoints: {},
      userActivities: {},
    };
  }

  // Component Life Cycle Functions
  componentDidMount() {
    this._fetchuserPointActivities();
  }

  // Component Functions

  _fetchuserPointActivities = async () => {
    const { username } = this.props;

    await getUser(username).then((userPoints) => {
      this.setState({ userPoints });
    }).catch((err) => {
      alert(err);
    });

    await getUserPoints(username).then((userActivities) => {
      // this.setState({ userPointActivities: res });
      this.setState({ userActivities });
    }).catch((err) => {
      alert(err);
    });
  }

  render() {
    const { userPoints, userActivities } = this.state;

    return <PointsView userPoints={userPoints} userActivities={userActivities} />;
  }
}

const mapStateToProps = state => ({
  username: state.account.currentAccount.name,
});

export default connect(mapStateToProps)(PointsContainer);
