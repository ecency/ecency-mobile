import React, { Component, Fragment } from 'react';

// Components
import { ProfileScreen } from '..';

// Utilitites
import {
  followUser,
  unfollowUser,
  getFollows,
  getPosts,
  getUserComments,
  getUser,
  isFolllowing,
} from '../../../providers/steem/dsteem';
import { getUserData, getAuthStatus } from '../../../realm/realm';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      currentUser: null,
      comments: [],
      replies: [],
      about: {},
      follows: {},
      isLoggedIn: false,
      isLoading: false,
      isReverseHeader: false,
      isReady: false,
    };
  }

  async componentDidMount() {
    const { navigation } = this.props;
    const selectedUser = navigation.state && navigation.state.params;

    this._loadProfile(selectedUser);
  }

  componentWillReceiveProps(nextProps) {
    const { navigation } = this.props;
    const isParamsChange = nextProps.navigation.state
      && navigation.state
      && nextProps.navigation.state.params.username !== navigation.state.params.username;

    if (isParamsChange) {
      const selectedUser = nextProps.navigation.state && nextProps.navigation.state.params;

      this._loadProfile(selectedUser);
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

  // _unfollow = async () => {
  //   let userData;
  //   let privateKey;

  //   await this.setState({
  //     follow_loader: true,
  //   });

  //   await getUserData().then((result) => {
  //     userData = Array.from(result);
  //   });

  //   console.log(userData);
  //   privateKey = decryptKey(userData[0].postingKey, '1234');

  //   unfollowUser(
  //     {
  //       follower: userData[0].username,
  //       following: this.state.author.name,
  //     },
  //     privateKey,
  //   )
  //     .then((result) => {
  //       this.setState({
  //         follow_loader: false,
  //         isFolllowing: false,
  //       });
  //     })
  //     .catch((err) => {
  //       this.setState({
  //         follow_loader: false,
  //       });
  //     });
  // };

  // _follow = async () => {
  //   let userData;
  //   let privateKey;

  //   await this.setState({
  //     follow_loader: true,
  //   });

  //   await getUserData().then((result) => {
  //     userData = Array.from(result);
  //   });

  //   console.log(userData);
  //   privateKey = decryptKey(userData[0].postingKey, '1234');

  //   followUser(
  //     {
  //       follower: userData[0].username,
  //       following: this.state.author.name,
  //     },
  //     privateKey,
  //   )
  //     .then((result) => {
  //       console.log(result);
  //       this.setState({
  //         follow_loader: false,
  //         isFolllowing: true,
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       this.setState({
  //         follow_loader: false,
  //         isFolllowing: false,
  //       });
  //     });
  // };

  async _loadProfile(selectedUser = null) {
    // TODO: use from redux store.
    let isLoggedIn;
    let userData;
    let username;

    await getAuthStatus().then((res) => {
      isLoggedIn = res.isLoggedIn;
    });

    if (selectedUser) {
      username = selectedUser.username;
      this.setState({ isReverseHeader: true });
    } else if (isLoggedIn) {
      await getUserData().then((res) => {
        userData = Array.from(res)[0];
      });

      username = userData.username;
    }

    let user;
    let follows;
    let about;

    await getFollows(username).then((res) => {
      follows = res;
    });

    user = await getUser(username);

    about = user.json_metadata && JSON.parse(user.json_metadata);

    this.setState(
      {
        user,
        isLoggedIn,
        follows,
        username,
        about: about && about.profile,
      },
      () => {
        this._getComments(username);
      },
    );
  }

  render() {
    const {
      about,
      comments,
      follows,
      isReverseHeader,
      isLoading,
      isLoggedIn,
      user,
      isReady,
      username,
    } = this.state;

    return (
      <Fragment>
        <ProfileScreen
          isReady={isReady}
          about={about}
          isReverseHeader={isReverseHeader}
          comments={comments}
          follows={follows}
          isLoading={isLoading}
          isLoggedIn={isLoggedIn}
          username={username}
          user={user}
          {...this.props}
        />
      </Fragment>
    );
  }
}

export default ProfileContainer;
