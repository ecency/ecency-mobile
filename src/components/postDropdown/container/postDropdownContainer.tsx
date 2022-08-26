import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import { Alert, Share } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Services and Actions
import { followUser, getRelationship, ignoreUser, pinCommunityPost, profileUpdate, reblog, unfollowUser } from '../../../providers/hive/dhive';
import { addBookmark, addReport } from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer, showActionModal } from '../../../redux/actions/uiAction';
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Constants
import OPTIONS from '../../../constants/options/post';
import { default as ROUTES } from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';
import { getPostUrl } from '../../../utils/post';

// Component
import PostDropdownView from '../view/postDropdownView';
import { OptionsModal } from '../../atoms';
import { updateCurrentAccount } from '../../../redux/actions/accountAction';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class PostDropdownContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      options: OPTIONS
    };
  }

  componentDidMount = () => {
    this._initOptions();
  }

  UNSAFE_componentWillReceiveProps = (nextProps) => {
    if (nextProps.content?.permlink !== this.props.content?.permlink) {
      this._initOptions(nextProps);
    }
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

  _initOptions = ({ content, currentAccount, pageType, subscribedCommunities, isMuted } = this.props) => {    
    //check if post is owned by current user or not, if so pinned or not
    const _canUpdateBlogPin = !!pageType && !!content && !!currentAccount && currentAccount.name === content.author
    const _isPinnedInProfile = !!content && content.stats?.is_pinned_blog;


    //check community pin update eligibility
    const _canUpdateCommunityPin = subscribedCommunities.data && !!content && content.community
      ? subscribedCommunities.data.reduce((role, subscription) => {
        if (content.community === subscription[0]) {
          return ['owner', 'admin', 'mod'].includes(subscription[2]);
        }
        return role;
      }, false) : false;
    const _isPinnedInCommunity = !!content && content.stats?.is_pinned;
    

    //cook options list based on collected flags
    const options = OPTIONS.filter((option) => {
      switch (option) {
        case 'pin-blog':
          return _canUpdateBlogPin && !_isPinnedInProfile;
        case 'unpin-blog':
          return _canUpdateBlogPin && _isPinnedInProfile;
        case 'pin-community':
          return _canUpdateCommunityPin && !_isPinnedInCommunity;
        case 'unpin-community':
          return _canUpdateCommunityPin && _isPinnedInCommunity;
        case 'mute':
          return !isMuted;
        case 'unmute':
          return isMuted;
        default:
          return true;
      }
    })

    this.setState({ options })
  }

  // Component Functions
  _handleOnDropdownSelect = async (index) => {
    const { content, dispatch, intl, navigation, isMuted } = this.props;
    const { options } = this.state;
    console.log('content : ', content);
    
    switch (options[index]) {
      case 'copy':
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

      case 'reblog':
        this.actionSheetTimer = setTimeout(() => {
          this.ActionSheet.show();
          this.actionSheetTimer = 0;
        }, 100);
        break;

      case 'reply':
        this._redirectToReply();
        break;

      case 'share':
        this.shareTimer = setTimeout(() => {
          this._share();
          this.shareTimer = 0;
        }, 500);
        break;

      case 'bookmarks':
        this._addToBookmarks();
        break;

      case 'promote':
        this._redirectToPromote(ROUTES.SCREENS.REDEEM, 1, 'promote');
        break;

      case 'boost':
        this._redirectToPromote(ROUTES.SCREENS.REDEEM, 2, 'boost');
        break;

      case 'report':
        this._report(get(content, 'url'));
        break;
      case 'pin-blog':
        this._updatePinnedPost();
        break;
      case 'unpin-blog':
        this._updatePinnedPost({ unpinPost: true });
        break;
      case 'pin-community':
        this._updatePinnedPostCommunity();
        break;
      case 'unpin-community':
        this._updatePinnedPostCommunity({ unpinPost: true });
        break;
      case 'edit-history':
        navigation.navigate({
          routeName: ROUTES.SCREENS.EDIT_HISTORY,
          params: {
            author: content?.author || '',
            permlink: content?.permlink || '',
          },
        });
        break;
      case 'mute':
        this._handleMuteUnmuteUser(!isMuted);
        break;
      case 'unmute':
        this._handleMuteUnmuteUser(!isMuted);
        break;
      default:
        break;
    }
  };

  _handleMuteUnmuteUser = async (isMuteAction) => {
    const { currentAccount, content } = this.props as any;
    const username = content.author;
    const isOwnProfile = !username || currentAccount.username === username;
    console.log('isMuteAction,isOwnProfile : ', isMuteAction, isOwnProfile);

    if(!isOwnProfile){
      console.log('isMuteAction : ', isMuteAction);
      
      if (isMuteAction) {
        this._muteUser();
      } else {
        this._handleFollowUnfollowUser();
      }
    }
    
  };
  _muteUser = () => {
    const { currentAccount, pinCode, dispatch, intl, content, onLoadPosts } = this.props as any;
    const username = content.author;
    const follower = currentAccount.name;
    const following = username;
   
    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        const curMutes = currentAccount.mutes || [];
        if (curMutes.indexOf(username) < 0) {
          //check to avoid double entry corner case
          currentAccount.mutes = [username, ...curMutes];
        }
        dispatch(updateCurrentAccount(currentAccount));
        onLoadPosts(true); //fetch posts again after muting user
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_mute',
            }),
          ),
        );
      })
      .catch((err) => {
        this._profileActionDone({ error: err });
      });
 
  };

  _handleFollowUnfollowUser = async () => {
    console.log('inside _handleFollowUnfollowUser');
    
    const { currentAccount, pinCode, dispatch, intl, content, onLoadPosts } = this.props as any;
    const username = content.author;
    const follower = get(currentAccount, 'name', '');
    const following = username;

    let followAction;
    const res = await getRelationship(currentAccount.name, username);
    const _isFollowing = res && res.follows;
    const _isMuted = res && res.ignores;
          
    if (_isMuted) {
      followAction = followUser;
    } 
    if(_isFollowing) {
      followAction = unfollowUser;
    }

    followAction(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        //means user is now being followed
        if (!_isFollowing || _isMuted) {
          const mutes = currentAccount.mutes || [];
          const mutedIndex = mutes.indexOf(username);
          if (mutedIndex >= 0) {
            mutes.splice(mutedIndex, 1);
            currentAccount.mutes = mutes;
            dispatch(updateCurrentAccount(currentAccount));
          }
        }
        onLoadPosts(true); //fetch posts again after muting user
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: !_isFollowing || _isMuted ? 'alert.success_follow' : 'alert.success_unfollow',
            }),
          ),
        );

      })
      .catch((err) => {
        this._profileActionDone({ error: err });
      });
  };

  _profileActionDone = ({ error = null }) => {
    const { intl, dispatch, content } = this.props;

    this.setState({
      isProfileLoading: false,
    });
    if (error) {
      if (error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
        //when RC is not enough, offer boosting account
        dispatch(setRcOffer(true));
      } else {
        Alert.alert(
          intl.formatMessage({
            id: 'alert.fail',
          }),
          error.message || error.toString(),
        );
      }
    }
  };

  _share = () => {
    const { content } = this.props;
    const postUrl = getPostUrl(get(content, 'url'));

    Share.share({
      message: `${get(content, 'title')} ${postUrl}`,
    });
  };

  _report = (url) => {
    const { dispatch, intl } = this.props;

    const _onConfirm = () => {
      addReport('content', url)
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'report.added',
              }),
            ),
          );
        })
        .catch(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'report.added',
              }),
            ),
          );
        });
    }

    dispatch(
      showActionModal({
        title: intl.formatMessage({ id: 'report.confirm_report_title' }),
        body: intl.formatMessage({ id: 'report.confirm_report_body' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => { },
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: _onConfirm,
          },
        ],
      }),
    );

  };

  _addToBookmarks = () => {
    const { content, dispatch, intl } = this.props;

    addBookmark(get(content, 'author'), get(content, 'permlink'))
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
      reblog(currentAccount, pinCode, content.author, get(content, 'permlink', ''))
        .then(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.success_rebloged',
              }),
            ),
          );
        })
        .catch((error) => {
          if (String(get(error, 'jse_shortmsg', '')).indexOf('has already reblogged') > -1) {
            dispatch(
              toastNotification(
                intl.formatMessage({
                  id: 'alert.already_rebloged',
                }),
              ),
            );
          } else {
            if (error && error.jse_shortmsg.split(': ')[1].includes('wait to transact')) {
              //when RC is not enough, offer boosting account
              dispatch(setRcOffer(true));
            } else {
              //when other errors
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            }
          }
        });
    }
  };

  _updatePinnedPost = async ({ unpinPost }: { unpinPost: boolean } = { unpinPost: false }) => {
    const { content, currentAccount, pinCode, dispatch, intl, isLoggedIn } = this.props;

    const params = {
      ...currentAccount.about.profile,
      pinned: unpinPost ? null : content.permlink
    };


    try {
      await profileUpdate(params, pinCode, currentAccount);

      currentAccount.about.profile = { ...params };

      dispatch(updateCurrentAccount({ ...currentAccount }));
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      //TOOD: signal posts or pinned post refresh


    } catch (err) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message', err.toString()),
      );
    }
  }

  _updatePinnedPostCommunity = async ({ unpinPost }: { unpinPost: boolean } = { unpinPost: false }) => {
    const { content, currentAccount, pinCode, dispatch, intl } = this.props;

    try {
      await pinCommunityPost(currentAccount, pinCode, content.community, content.author, content.permlink, unpinPost);
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

    } catch (err) {
      console.warn("Failed to update pin status of community post", err);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message', err.toString()),
      );
    }

  }

  _redirectToReply = () => {
    const { content, fetchPost, isLoggedIn, navigation } = this.props;

    if (isLoggedIn) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${content.permlink}`,
        params: {
          isReply: true,
          post: content,
          fetchPost,
        },
      });
    }
  };

  _redirectToPromote = (routeName, from, redeemType) => {
    const { content, isLoggedIn, navigation, dispatch, isPinCodeOpen } = this.props;
    const params = {
      from,
      permlink: `${get(content, 'author')}/${get(content, 'permlink')}`,
      redeemType,
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
    const {
      intl,
      currentAccount: { name },
      content,
      isMuted
    } = this.props;
    const { options } = this.state;
    
    return (
      <Fragment>
        <PostDropdownView
          options={options.map((item) =>
            intl.formatMessage({ id: `post_dropdown.${item}` }).toUpperCase(),
          )}
          handleOnDropdownSelect={this._handleOnDropdownSelect}
          {...this.props}
        />
        <OptionsModal
          ref={(o) => (this.ActionSheet = o)}
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

const mapStateToProps = (state) => ({
  isLoggedIn: state.application.isLoggedIn,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
  subscribedCommunities: state.communities.subscribedCommunities,
});

export default withNavigation(connect(mapStateToProps)(injectIntl(PostDropdownContainer)));
