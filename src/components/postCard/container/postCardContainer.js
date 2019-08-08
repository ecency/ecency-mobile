import React, { PureComponent } from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

// Dsteem
import { getPost } from '../../../providers/steem/dsteem';

import PostCardView from '../view/postCardView';

// Constants
import { default as ROUTES } from '../../../constants/routeNames';
/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostCardContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      _content: null,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isRefresh) {
      this._fetchPost();
    }
  }

  _handleOnUserPress = () => {
    const { navigation, currentAccount, content } = this.props;
    if (content && currentAccount.name !== content.author) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username: content.author,
          reputation: content.author_reputation,
        },
        key: content.author,
      });
    }
  };

  _handleOnContentPress = content => {
    const { navigation } = this.props;

    if (content) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          content,
        },
        key: content.permlink,
      });
    }
  };

  _handleOnVotersPress = activeVotes => {
    const { navigation, content } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.VOTERS,
      params: {
        activeVotes,
      },
      key: content.permlink,
    });
  };

  _fetchPost = async () => {
    const { currentAccount, content } = this.props;

    await getPost(content.author, content.permlink, currentAccount.username)
      .then(result => {
        if (result) {
          this.setState({ _content: result });
        }
      })
      .catch(() => {});
  };

  render() {
    const { content, isHideImage, nsfw } = this.props;
    const { _content } = this.state;

    const isNsfwPost = nsfw === '1';

    return (
      <PostCardView
        handleOnUserPress={this._handleOnUserPress}
        handleOnContentPress={this._handleOnContentPress}
        handleOnVotersPress={this._handleOnVotersPress}
        fetchPost={this._fetchPost}
        content={_content || content}
        isHideImage={isHideImage}
        isNsfwPost={isNsfwPost}
      />
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
  nsfw: state.application.nsfw,
});

export default withNavigation(connect(mapStateToProps)(PostCardContainer));
