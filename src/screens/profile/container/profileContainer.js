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
      user: [],
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

  // componentWillMount() {
  //   console.log(this.props.navigation.state.params);
  // }

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
      alert('degisti');
      const selectedUser = nextProps.navigation.state && nextProps.navigation.state.params;

      this._loadProfile(selectedUser);
    }
  }

  _getBlog = (user) => {
    this.setState({ isLoading: true });
    getPosts('blog', { tag: user, limit: 10 }, user)
      .then((result) => {
        this.setState({
          isReady: true,
          posts: result,
          start_author: result[result.length - 1].author,
          start_permlink: result[result.length - 1].permlink,
          refreshing: false,
          isLoading: false,
        });
      })
      .catch((err) => {
        alert(err);
      });
  };

  _getMore = async () => {
    const {
      posts, user, start_author, start_permlink,
    } = this.state;
    if (user) {
      await getPosts(
        'blog',
        {
          tag: user.name,
          limit: 10,
          start_author,
          start_permlink,
        },
        user.name,
      ).then((result) => {
        const _posts = result;

        _posts && _posts.shift();
        this.setState({
          posts: [...posts, ..._posts],
          start_author: result[result.length - 1] && result[result.length - 1].author,
          start_permlink: result[result.length - 1] && result[result.length - 1].permlink,
          isLoading: false,
        });
      });
    }
  };

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
    // const { navigation } = this.props;

    // TODO: use from redux store.
    let isLoggedIn;
    let userData;
    let username;

    // const selectedUser = navigation.state && navigation.state.params;

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
        about: about && about.profile,
      },
      () => {
        this._getBlog(username);
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
    } = this.state;

    return (
      <Fragment>
        <ProfileScreen
          isReady={isReady}
          about={about}
          isReverseHeader={isReverseHeader}
          commments={commments}
          follows={follows}
          getMorePost={this._getMore}
          isLoading={isLoading}
          isLoggedIn={isLoggedIn}
          // posts={posts}
          user={user}
          {...this.props}
        />
      </Fragment>
    );
  }
}

export default ProfileContainer;
