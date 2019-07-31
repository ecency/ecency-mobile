import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Share } from 'react-native';
import ActionSheet from 'react-native-actionsheet';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import { reblog } from '../../../providers/steem/dsteem';
import { addBookmark } from '../../../providers/esteem/esteem';
import { toastNotification } from '../../../redux/actions/uiAction';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

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
  componentWillUnmount = () => {
    if (this.alertTimer) {
      clearTimeout(this.alertTimer);
      this.alertTimer = 0;
    }

    if (this.shareTimer) {
      clearTimeout(this.shareTimer);
      this.shareTimer = 0;
    }

    if (this.actionSheetTimer) {
      clearTimeout(this.actionSheetTimer);
      this.actionSheetTimer = 0;
    }
  };

  // Component Functions
  _handleOnDropdownSelect = async (index, item) => {
    const { content, dispatch, intl } = this.props;

    switch (item) {
      case 'COPY LINK':
        await writeToClipboard(getPostUrl(get(content, 'url')));
        this.alertTimer = setTimeout(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
          this.alertTimer = 0;
        }, 300);
        break;

      case 'REBLOG':
        this.actionSheetTimer = setTimeout(() => {
          this.ActionSheet.show();
          this.actionSheetTimer = 0;
        }, 100);
        break;

      case 'REPLY':
        this._redirectToReply();
        break;

      case 'SHARE':
        this.shareTimer = setTimeout(() => {
          this._share();
          this.shareTimer = 0;
        }, 500);
        break;

      case 'ADD TO BOOKMARKS':
        this._addToBookmarks();
        break;

      case 'PROMOTE':
        this._redirectToPromote(ROUTES.SCREENS.PROMOTE, 1);
        break;

      case 'BOOST':
        this._redirectToPromote(ROUTES.SCREENS.BOOST_POST, 2);
        break;

      default:
        break;
    }
  };

  _share = () => {
    const { content } = this.props;
    const postUrl = getPostUrl(get(content, 'url'));

    Share.share({
      message: `${content.title} ${postUrl}`,
    });
  };

  _addToBookmarks = () => {
    const { content, currentAccount, dispatch, intl } = this.props;

    addBookmark(currentAccount.name, content.author, content.permlink)
      .then(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'bookmarks.added',
            }),
          ),
        );
      })
      .catch(() => {
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.fail',
            }),
          ),
        );
      });
  };

  _reblog = () => {
    const { content, currentAccount, dispatch, intl, isLoggedIn, pinCode } = this.props;
    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, content.permlink)
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.success_rebloged',
              }),
            ),
          );
        })
        .catch(error => {
          if (error.jse_shortmsg && String(error.jse_shortmsg).indexOf('has already reblogged')) {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.already_rebloged',
                }),
              ),
            );
          } else {
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
          }
        });
    }
  };

  _redirectToReply = () => {
    const { content, fetchPost, isLoggedIn, navigation } = this.props;

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

  _redirectToPromote = (routeName, from) => {
    const { content, isLoggedIn, navigation, dispatch, isPinCodeOpen } = this.props;
    const params = {
      from,
      permlink: `${get(content, 'author')}/${get(content, 'permlink')}`,
    };

    if (isPinCodeOpen) {
      dispatch(
        openPinCodeModal({
          navigateTo: routeName,
          navigateParams: params,
        }),
      );
    } else if (isLoggedIn) {
      navigation.navigate({
        routeName,
        params,
      });
    }
  };

  render() {
    const { intl, currentAccount, content, isHideReblogOption } = this.props;
    let _OPTIONS = OPTIONS;

    if ((content && content.author === currentAccount.name) || isHideReblogOption) {
      _OPTIONS = OPTIONS.filter(item => item !== 'reblog');
    }

    return (
      <Fragment>
        <PostDropdownView
          options={_OPTIONS.map(item =>
            intl.formatMessage({ id: `post_dropdown.${item}` }).toUpperCase(),
          )}
          handleOnDropdownSelect={this._handleOnDropdownSelect}
          {...this.props}
        />
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={['Reblog', intl.formatMessage({ id: 'alert.cancel' })]}
          title={intl.formatMessage({ id: 'post.reblog_alert' })}
          cancelButtonIndex={1}
          onPress={index => {
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
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDropdownContainer)));
