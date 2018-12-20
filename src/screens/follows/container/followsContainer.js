import React, { Component } from 'react';

// Middleware

// Constants
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities

// Services and Actions
import { getFollowers, getFollowing, getFollowSearch } from '../../../providers/steem/dsteem';
// Component
import FollowsScreen from '../screen/followsScreen';

/*
  *            Props Name        Description                                     Value
  *@props -->  props name here   description here                                Value Type Here
  *
  */

class FollowsContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: null,
      users: [],
      count: null,
      isFollowingPress: null,
      startWith: '',
      filterResult: null,
    };
  }

  // Component Life Cycle Functions
  async componentDidMount() {
    const { navigation } = this.props;

    if (navigation.state && navigation.state.params) {
      const { count, username, isFollowingPress } = navigation.state.params;

      this.setState({
        count,
        username,
        isFollowingPress,
      });

      await this._loadFollows(username, isFollowingPress);
    }
  }

  // Component Functions
  _loadFollows = async (_username = null, _isFollowingPress = null) => {
    let _users;
    let _startWith;
    const {
      username, users, isFollowingPress, startWith, count,
    } = this.state;

    if (users && count === users.length + 1) return;

    const name = username || _username;
    const isFollowing = isFollowingPress || _isFollowingPress;

    this.setState({ isLoading: true });

    if (!isFollowing) {
      await getFollowers(name, startWith).then((result) => {
        _users = result;
        _startWith = users && users[users.length - 1] && users[users.length - 1].follower;
      });
    } else {
      await getFollowing(name, startWith).then((result) => {
        _users = result;
        _startWith = users && users[users.length - 1] && users[users.length - 1].following;
      });
    }

    !_username && _users.shift();

    this.setState({
      users: !_username ? [...users, ..._users] : _users,
      startWith: _startWith,
      isLoading: false,
    });
  };

  _handleSearch = async (text) => {
    const { users, username } = this.state;
    let newData;

    newData = users.filter((item) => {
      const itemName = item.follower.toUpperCase();
      const _text = text.toUpperCase();

      return itemName.indexOf(_text) > -1;
    });

    if (newData.length <= 0) {
      newData = await getFollowSearch(username, text);
    }

    this.setState({ filterResult: newData });
  };

  _handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  render() {
    const {
      isFollowingPress, users, isLoading, count, username, filterResult,
    } = this.state;

    if (!users) {
      return null;
    }
    return (
      <FollowsScreen
        loadMore={this._loadFollows}
        isFollowing={isFollowingPress}
        data={users}
        filterResult={filterResult}
        username={username}
        count={count}
        isLoading={isLoading}
        handleSearch={this._handleSearch}
        handleOnUserPress={this._handleOnUserPress}
        {...this.props}
      />
    );
  }
}

export default FollowsContainer;
