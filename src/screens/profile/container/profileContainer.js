import React, { Component, Fragment } from 'react';

// Components
import { ProfileScreen } from '..';

// Utilitites
import {
  getFollows, getPosts, getUser, getUserComments,
} from '../../../providers/steem/dsteem';
import { getUserData, getAuthStatus } from '../../../realm/realm';

class ProfileContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      posts: [],
      commments: [],
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
          commments: result,
          refreshing: false,
          isLoading: false,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  async _loadProfile(selectedUser = null) {
    // TODO: use from redux store.
    let isLoggedIn;
    let userData;
    let username;

    await getAuthStatus().then((res) => {
      isLoggedIn = res;
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
      commments,
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
          commments={commments}
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
