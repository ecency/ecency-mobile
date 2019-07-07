import React, { Component } from 'react';
import get from 'lodash/get';

// Middleware

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
      users: null,
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

      this._loadFollows(username, isFollowingPress);
    }
  }

  // Component Functions
  _loadFollows = async (_username = null, _isFollowingPress = null) => {
    let _users;
    let _startWith;
    const { username, users, isFollowingPress, startWith, count } = this.state;

    if ((users && count < 100) || (users && count === users.length + 1)) return;

    const name = username || _username;
    const isFollowing = isFollowingPress || _isFollowingPress;

    this.setState({ isLoading: true });

    if (!isFollowing) {
      await getFollowers(name, startWith).then(result => {
        _users = result;
        _startWith = result && result[result.length - 1] && result[result.length - 1].follower;
      });
    } else {
      await getFollowing(name, startWith).then(result => {
        _users = result;
        _startWith = result && result[result.length - 1] && result[result.length - 1].following;
      });
    }

    if (!_username) _users.shift();

    this.setState({
      users: !_username ? [...users, ..._users] : _users,
      startWith: _startWith,
      isLoading: false,
    });
  };

  _handleSearch = async text => {
    const { count, users, username, isFollowingPress } = this.state;
    let newData;
    // const isAllFetch = count === users.length;

    if (count !== users.length) {
      newData = users.filter(item => {
        const itemName = isFollowingPress
          ? get(item, 'following').toUpperCase()
          : get(item, 'follower').toUpperCase();
        const _text = text.toUpperCase();

        return itemName.indexOf(_text) > -1;
      });
    }

    if (!newData || newData.length < 1) {
      const followSearch = await getFollowSearch(username, text);
      newData = followSearch || {};
    }

    this.setState({
      filterResult: newData,
      isLoading: false,
    });
  };

  render() {
    const { isFollowingPress, users, isLoading, count, username, filterResult } = this.state;

    return (
      <FollowsScreen
        loadMore={this._loadFollows}
        isFollowing={isFollowingPress}
        data={filterResult || users}
        filterResult={filterResult}
        username={username}
        count={count}
        isLoading={isLoading}
        handleSearch={this._handleSearch}
      />
    );
  }
}

export default FollowsContainer;
