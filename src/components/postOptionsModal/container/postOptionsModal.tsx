import React, { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { Alert, Share, Text, TouchableHighlight } from 'react-native';
import { useIntl } from 'react-intl';
import get from 'lodash/get';
import EStyleSheet from 'react-native-extended-stylesheet';

// Services and Actions
import { useNavigation } from '@react-navigation/native';
import { FlatList } from 'react-native-gesture-handler';
import ActionSheet from 'react-native-actions-sheet';
import { ignoreUser, pinCommunityPost, profileUpdate, reblog } from '../../../providers/hive/dhive';
import { addBookmark, addReport } from '../../../providers/ecency/ecency';
import { toastNotification, setRcOffer, showActionModal } from '../../../redux/actions/uiAction';

// Constants
import OPTIONS from '../../../constants/options/post';
import ROUTES from '../../../constants/routeNames';

// Utilities
import { writeToClipboard } from '../../../utils/clipboard';
import { getPostUrl } from '../../../utils/post';

// Component

import { updateCurrentAccount } from '../../../redux/actions/accountAction';
import showLoginAlert from '../../../utils/showLoginAlert';
import { useUserActivityMutation } from '../../../providers/queries/pointQueries';
import { PointActivityIds } from '../../../providers/ecency/ecency.types';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import styles from '../styles/postOptionsModal.styles';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

interface Props {
  pageType?: string;
}

const PostOptionsModal = ({ pageType }: Props, ref) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const userActivityMutation = useUserActivityMutation();

  const bottomSheetModalRef = useRef<ActionSheet | null>(null);
  const alertTimer = useRef<any>(null);
  const shareTimer = useRef<any>(null);
  const actionSheetTimer = useRef<any>(null);
  const reportTimer = useRef<any>(null);

  const isLoggedIn = useAppSelector((state) => state.application.isLoggedIn);
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const pinCode = useAppSelector((state) => state.application.pin);
  const isPinCodeOpen = useAppSelector((state) => state.application.isPinCodeOpen);
  const subscribedCommunities = useAppSelector((state) => state.communities.subscribedCommunities);

  const [content, setContent] = useState<any>(null);
  const [options, setOptions] = useState(OPTIONS);

  useImperativeHandle(ref, () => ({
    show: (_content) => {
      if (!_content) {
        Alert.alert(
          intl.formatMessage({ id: 'alert.something_wrong' }),
          'Post content not passed for viewing post options',
        );
        return;
      }

      if (bottomSheetModalRef.current) {
        setContent(_content);
        bottomSheetModalRef.current.show();
      }
    },
  }));

  useEffect(() => {
    if (content) {
      _initOptions();
    }

    return () => {
      if (alertTimer.current) {
        clearTimeout(alertTimer.current);
        alertTimer.current = null;
      }

      if (shareTimer.current) {
        clearTimeout(shareTimer.current);
        shareTimer.current = null;
      }

      if (actionSheetTimer.current) {
        clearTimeout(actionSheetTimer.current);
        actionSheetTimer.current = null;
      }
      if (reportTimer.current) {
        clearTimeout(reportTimer.current);
        reportTimer.current = null;
      }
    };
  }, [content]);

  const _initOptions = () => {
    // check if post is owned by current user or not, if so pinned or not
    const _canUpdateBlogPin =
      !!pageType && !!content && !!currentAccount && currentAccount.name === content.author;
    const _isPinnedInProfile = !!content && content.stats?.is_pinned_blog;

    // check community pin update eligibility
    const _canUpdateCommunityPin =
      subscribedCommunities.data && !!content && content.community
        ? subscribedCommunities.data.reduce((role, subscription) => {
            if (content.community === subscription[0]) {
              return ['owner', 'admin', 'mod'].includes(subscription[2]);
            }
            return role;
          }, false)
        : false;
    const _isPinnedInCommunity = !!content && content.stats?.is_pinned;

    // cook options list based on collected flags
    const _options = OPTIONS.filter((option) => {
      switch (option) {
        case 'pin-blog':
          return _canUpdateBlogPin && !_isPinnedInProfile;
        case 'unpin-blog':
          return _canUpdateBlogPin && _isPinnedInProfile;
        case 'pin-community':
          return _canUpdateCommunityPin && !_isPinnedInCommunity;
        case 'unpin-community':
          return _canUpdateCommunityPin && _isPinnedInCommunity;
        default:
          return true;
      }
    });

    setOptions(_options);
  };

  const _muteUser = () => {
    const username = content.author;
    const follower = currentAccount.name;
    const following = username;

    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    ignoreUser(currentAccount, pinCode, {
      follower,
      following,
    })
      .then(() => {
        const curMutes = currentAccount.mutes || [];
        if (curMutes.indexOf(username) < 0) {
          // check to avoid double entry corner case
          currentAccount.mutes = [username, ...curMutes];
        }
        dispatch(updateCurrentAccount(currentAccount));
        dispatch(
          toastNotification(
            intl.formatMessage({
              id: 'alert.success_mute',
            }),
          ),
        );
      })
      .catch((err) => {
        _profileActionDone({ error: err });
      });
  };

  const _profileActionDone = ({ error = null }: { error: any }) => {
    if (error) {
      if (error.jse_shortmsg && error.jse_shortmsg.includes('wait to transact')) {
        // when RC is not enough, offer boosting account
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

  const _share = () => {
    const postUrl = getPostUrl(get(content, 'url'));

    Share.share({
      message: `${get(content, 'title')} ${postUrl}`,
    });
  };

  const _report = (url) => {
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
    };

    dispatch(
      showActionModal({
        title: intl.formatMessage({ id: 'report.confirm_report_title' }),
        body: intl.formatMessage({ id: 'report.confirm_report_body' }),
        buttons: [
          {
            text: intl.formatMessage({ id: 'alert.cancel' }),
            onPress: () => {
              console.log('cancel pressed');
            },
          },
          {
            text: intl.formatMessage({ id: 'alert.confirm' }),
            onPress: _onConfirm,
          },
        ],
      }),
    );
  };

  const _addToBookmarks = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
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

  const _reblog = () => {
    if (!isLoggedIn) {
      showLoginAlert({ intl });
      return;
    }
    if (isLoggedIn) {
      reblog(currentAccount, pinCode, content.author, get(content, 'permlink', ''))
        .then((response) => {
          // track user activity points ty=130
          userActivityMutation.mutate({
            pointsTy: PointActivityIds.REBLOG,
            transactionId: response.id,
          });

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
              // when RC is not enough, offer boosting account
              dispatch(setRcOffer(true));
            } else {
              // when other errors
              dispatch(toastNotification(intl.formatMessage({ id: 'alert.fail' })));
            }
          }
        });
    }
  };

  const _updatePinnedPost = async (
    { unpinPost }: { unpinPost: boolean } = { unpinPost: false },
  ) => {
    const params = {
      ...currentAccount.about.profile,
      pinned: unpinPost ? null : content.permlink,
    };

    try {
      await profileUpdate(params, pinCode, currentAccount);

      currentAccount.about.profile = { ...params };

      dispatch(updateCurrentAccount({ ...currentAccount }));
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));

      // TOOD: signal posts or pinned post refresh
    } catch (err) {
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message', err.toString()),
      );
    }
  };

  const _updatePinnedPostCommunity = async (
    { unpinPost }: { unpinPost: boolean } = { unpinPost: false },
  ) => {
    try {
      await pinCommunityPost(
        currentAccount,
        pinCode,
        content.community,
        content.author,
        content.permlink,
        unpinPost,
      );
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
    } catch (err) {
      console.warn('Failed to update pin status of community post', err);
      Alert.alert(
        intl.formatMessage({
          id: 'alert.fail',
        }),
        get(err, 'message', err.toString()),
      );
    }
  };

  const _redirectToReply = () => {
    if (isLoggedIn) {
      navigation.navigate({
        name: ROUTES.SCREENS.EDITOR,
        key: `editor_post_${content.permlink}`,
        params: {
          isReply: true,
          post: content,
        },
      });
    }
  };

  const _redirectToPromote = (name, from, redeemType) => {
    const params = {
      from,
      permlink: `${get(content, 'author')}/${get(content, 'permlink')}`,
      redeemType,
    };

    if (isPinCodeOpen) {
      navigation.navigate({
        name: ROUTES.SCREENS.PINCODE,
        params: {
          navigateTo: name,
          navigateParams: params,
        },
      });
    } else if (isLoggedIn) {
      navigation.navigate({
        name,
        params,
      });
    }
  };

  // Component Functions
  const _handleOnDropdownSelect = async (index) => {
    const username = content.author;
    const isOwnProfile = !username || currentAccount.username === username;

    switch (options[index]) {
      case 'copy':
        await writeToClipboard(getPostUrl(get(content, 'url')));
        alertTimer.current = setTimeout(() => {
          dispatch(
            toastNotification(
              intl.formatMessage({
                id: 'alert.copied',
              }),
            ),
          );
          alertTimer.current = null;
        }, 300);
        break;

      case 'reblog':
        _reblog();
        break;

      case 'reply':
        _redirectToReply();
        break;

      case 'share':
        shareTimer.current = setTimeout(() => {
          _share();
          shareTimer.current = null;
        }, 500);
        break;

      case 'bookmarks':
        _addToBookmarks();
        break;

      case 'promote':
        _redirectToPromote(ROUTES.SCREENS.REDEEM, 1, 'promote');
        break;

      case 'boost':
        _redirectToPromote(ROUTES.SCREENS.REDEEM, 2, 'boost');
        break;

      case 'report':
        reportTimer.current = setTimeout(() => {
          _report(get(content, 'url'));
        }, 300);

        break;
      case 'pin-blog':
        _updatePinnedPost();
        break;
      case 'unpin-blog':
        _updatePinnedPost({ unpinPost: true });
        break;
      case 'pin-community':
        _updatePinnedPostCommunity();
        break;
      case 'unpin-community':
        _updatePinnedPostCommunity({ unpinPost: true });
        break;
      case 'edit-history':
        navigation.navigate({
          name: ROUTES.SCREENS.EDIT_HISTORY,
          params: {
            author: content?.author || '',
            permlink: content?.permlink || '',
          },
        });
        break;
      case 'mute':
        !isOwnProfile && _muteUser();
        break;
      default:
        break;
    }
  };

  const _renderItem = ({ item, index }: { item: string; index: number }) => {
    const _onPress = () => {
      bottomSheetModalRef.current?.hide();
      _handleOnDropdownSelect(index);
    };

    return (
      <TouchableHighlight
        underlayColor={EStyleSheet.value('$primaryLightBackground')}
        onPress={_onPress}
      >
        <Text style={styles.dropdownItem}>
          {intl.formatMessage({ id: `post_dropdown.${item}` }).toLocaleUpperCase()}
        </Text>
      </TouchableHighlight>
    );
  };

  return (
    <ActionSheet
      ref={bottomSheetModalRef}
      gestureEnabled={true}
      hideUnderlay={true}
      containerStyle={styles.sheetContent}
      indicatorStyle={styles.indicator}
    >
      <FlatList
        contentContainerStyle={styles.listContainer}
        data={options}
        renderItem={_renderItem}
        keyExtractor={(item) => item}
      />
    </ActionSheet>
  );
};

export default forwardRef(PostOptionsModal);
