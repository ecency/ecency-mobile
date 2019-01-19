import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Alert, Share } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';

// Services and Actions
import { reblog } from '../../../providers/steem/dsteem';

// Middleware

// Constants
import OPTIONS from '../../../constants/options/post';
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';
import { getPostUrl } from '../../../utils/post';

// Component
import PostDropdownView from '../view/postDropdownView';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostDropdownContainer extends PureComponent {
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
        writeToClipboard(getPostUrl(content.url));
        break;

      case '1':
        setTimeout(() => {
          this.ActionSheet.show();
        }, 100);
        break;

      case '2':
        this._replyNavigation();
        break;
      case '3':
        setTimeout(() => {
          this._share();
        }, 500);
        break;

      default:
        break;
    }
  };

  _share = () => {
    const { content } = this.props;

    Share.share({
      message: content.title,
      url: getPostUrl(content.url),
    });
  };

  _reblog = () => {
    const {
      currentAccount, content, isLoggedIn, pinCode, intl,
    } = this.props;
    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, content.permlink)
        .then(() => {
          Alert.alert(
            intl.formatMessage({
              id: 'alert.success',
            }),
            intl.formatMessage({
              id: 'alert.success_rebloged',
            }),
          );
        })
        .catch((error) => {
          if (error.jse_shortmsg && String(error.jse_shortmsg).indexOf('has already reblogged')) {
            Alert.alert(
              intl.formatMessage({
                id: 'alert.already_rebloged',
              }),
            );
          } else {
            Alert.alert(
              intl.formatMessage({
                id: 'alert.fail',
              }),
            );
          }
        });
    }
  };

  _replyNavigation = () => {
    const {
      navigation, content, isLoggedIn, fetchPost,
    } = this.props;

    if (isLoggedIn) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        params: {
          isReply: true,
          post: content,
          fetchPost,
        },
      });
    }
  };

  render() {
    const { intl } = this.props;

    return (
      <Fragment>
        <PostDropdownView
          options={OPTIONS.map(item => intl.formatMessage({ id: `post_dropdown.${item}` }).toUpperCase())}
          handleOnDropdownSelect={this._handleOnDropdownSelect}
          {...this.props}
        />
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={['Reblog', intl.formatMessage({ id: 'alert.cancel' })]}
          title={intl.formatMessage({ id: 'post.reblog_alert' })}
          cancelButtonIndex={1}
          onPress={(index) => {
            index === 0 ? this._reblog() : null;
          }}
        />
      </Fragment>
    );
  }
}

const mapStateToProps = state => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.account.pin,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDropdownContainer)));
