import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';

// Components
import { ProfileScreen } from '..';

// Utilitites
import {
  followUser,
  unfollowUser,
  getFollows,
  getUserComments,
  getUser,
  isFolllowing,
  getFollowing,
} from '../../../providers/steem/dsteem';
import { getUserData } from '../../../realm/realm';
import { decryptKey } from '../../../utils/crypto';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      comments: [],
      replies: [],
      follows: {},
      isLoggedIn: false,
      isLoading: false,
      isReverseHeader: false,
      isReady: false,
      isFollowing: false,
      isFollowLoading: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const selectedUser = navigation.state && navigation.state.params;

    this._loadProfile(selectedUser && selectedUser.username);
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props;
    const isParamsChange = nextProps.navigation.state
      && navigation.state
      && nextProps.navigation.state.params.username !== navigation.state.params.username;

    if (isParamsChange) {
      const selectedUser = nextProps.navigation.state && nextProps.navigation.state.params;

      this._loadProfile(selectedUser && selectedUser.username);
    }
  }

  _getComments = async (user) => {
    await getUserComments({ start_author: user, limit: 10 })
      .then((result) => {
        this.setState({
          isReady: true,
          comments: result,
          refreshing: false,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  _handleFollowUnfollowUser = (isFollowAction) => {
    const { username, isFollowing } = this.state;
    const { currentAccount } = this.props;

    const privateKey = decryptKey(currentAccount.realm_object.postingKey, '1234');

    this.setState({
      isFollowLoading: true,
    });

    if (isFollowAction && !isFollowing) {
      this._followUser(currentAccount.name, username, privateKey);
    } else {
      this._unfollowUser(currentAccount.name, username, privateKey);
    }
  };

  _unfollowUser = (follower, following, privateKey) => {
    unfollowUser(
      {
        follower,
        following,
      },
      privateKey,
    )
      .then((result) => {
        this._followActionDone();
      })
      .catch((err) => {
        this._followActionDone(err);
      });
  };

  _followUser = (follower, following, privateKey) => {
    followUser(
      {
        follower,
        following,
      },
      privateKey,
    )
      .then((result) => {
        this._followActionDone();
      })
      .catch((err) => {
        this._followActionDone(err);
      });
  };

  _followActionDone = (error = null) => {
    this.setState({
      isFollowLoading: false,
    });

    if (error) {
      this.setState({
        error,
      });
    } else {
      this._loadProfile();
    }
  };

  _loadProfile = async (selectedUser = null) => {
    let username;
    const { currentAccount, isLoggedIn } = this.props;
    const { username: _username } = this.state;
    const _selectedUser = selectedUser || _username;
    const _isFollowing = await isFolllowing(
      _selectedUser.username || _username,
      currentAccount.name,
    );

    if (_selectedUser) {
      username = selectedUser ? selectedUser : _selectedUser;
      this.setState({ isReverseHeader: true });
    } else if (isLoggedIn) {
      username = currentAccount.name;
    }

    let follows;

    await getFollows(username).then((res) => {
      follows = res;
    });

    const user = _selectedUser ? await getUser(username) : currentAccount;

    this.setState(
      {
        user,
        follows,
        username,
        isFollowing: _isFollowing,
      },
      () => {
        this._getComments(username);
      },
    );
  };

  render() {
    const {
      comments,
      error,
      follows,
      isFollowLoading,
      isFollowing,
      isLoading,
      isLoggedIn,
      isReady,
      isReverseHeader,
      user,
      username,
    } = this.state;

    return (
      <Fragment>
        <ProfileScreen
          about={user && user.about && user.about.profile}
          comments={comments}
          error={error}
          follows={follows}
          handleFollowUnfollowUser={this._handleFollowUnfollowUser}
          isFollowLoading={isFollowLoading}
          isFollowing={isFollowing}
          isLoading={isLoading}
          isLoggedIn={isLoggedIn}
          isReady={isReady}
          isReverseHeader={isReverseHeader}
          user={user}
          username={username}
          {...this.props}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(ProfileContainer);
