import React, { Component } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Dsteem
import { getPost } from '../../../providers/steem/dsteem';

import { PostCardView } from '..';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostCardContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      _content: null,
      error: null,
    };
  }

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

  _handleOnContentPress = (author, permlink) => {
    const { navigation } = this.props;

    if (author && permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  _handleOnVotersPress = (activeVotes) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
    });
  };

  _fetchPost = async () => {
    const { currentAccount, content } = this.props;

    await getPost(content.author, content.permlink, currentAccount.username)
      .then((result) => {
        if (result) {
          this.setState({ _content: result });
        }
      })
      .catch((err) => {
        this.setState({ error: err });
      });
  };

  render() {
    const { content, isHideImage } = this.props;
    const { _content } = this.state;

    return (
      <PostCardView
        handleOnUserPress={this._handleOnUserPress}
        handleOnContentPress={this._handleOnContentPress}
        handleOnVotersPress={this._handleOnVotersPress}
        fetchPost={this._fetchPost}
        content={_content || content}
        isHideImage={isHideImage}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
