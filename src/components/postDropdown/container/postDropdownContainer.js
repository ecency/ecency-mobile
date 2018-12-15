import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Alert } from 'react-native';

// Services and Actions
import { reblog } from '../../../providers/steem/dsteem';

// Middleware

// Constants
import OPTIONS from '../../../constants/options/post';
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';

// Component
import { PostDropdownView } from '..';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostDropdownContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions
  _handleOnDropdownSelect = (index) => {
    const { content } = this.props;

    switch (index) {
      case '0':
        writeToClipboard(`https://steemit.com${content.url}`);
        break;

      case '1':
        this._reblog();
        break;

      case '2':
        this._replyNavigation();
        break;

      default:
        break;
    }
  };

  _reblog = () => {
    const { currentAccount, content, isLoggedIn } = this.props;
    if (isLoggedIn) {
      reblog(currentAccount, content.author, content.permlink)
        .then((result) => {
          Alert.alert('Success', 'Rebloged!');
        })
        .catch((error) => {
          if (error.jse_shortmsg && String(error.jse_shortmsg).indexOf('has already reblogged')) {
            Alert.alert('You already reblogged!');
          } else {
            Alert.alert('Failed!');
          }
        });
    }
  };

  _replyNavigation = () => {
    const { navigation, content, isLoggedIn } = this.props;
    if (isLoggedIn) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        params: {
          isReply: true,
          post: content,
        },
      });
    }
  };

  render() {
    return (
      <PostDropdownView
        options={OPTIONS}
        handleOnDropdownSelect={this._handleOnDropdownSelect}
        {...this.props}
      />
    );
  }
}

const mapStateToProps = state => ({
  selectedApi: state.application.api,
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
});
export default withNavigation(connect(mapStateToProps)(PostDropdownContainer));
