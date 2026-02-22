import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import { getPostQueryOptions, useBroadcastMutation, buildBoostOpWithPoints } from '@ecency/sdk';
import {
  selectCurrentAccount,
  selectGlobalProps,
  selectIsPinCodeOpen,
  selectOtherAccounts,
  selectIsConnected,
} from '../redux/selectors';
import { getQueryClient } from '../providers/queries';
import { toastNotification } from '../redux/actions/uiAction';
import { usePromoteMutation, useBoostPlusMutation } from '../providers/sdk/mutations';
import { useAuthContext } from '../providers/sdk';

/*
 *            Props Name        Description                                     Value
 *@props -->  props name here   description here                                Value Type Here
 *
 */

class RedeemContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isSCModalOpen: false,
      SCPath: '',
    };
  }

  // Component Life Cycle Functions

  // Component Functions

  _redeemAction = async (user, redeemType = 'promote', actionSpecificParam, author, permlink) => {
    const { dispatch, intl, navigation } = this.props;
    const { promoteMutation, boostPlusMutation, boostMutation } = this.props;

    this.setState({ isLoading: true });

    try {
      switch (redeemType) {
        case 'promote':
          await promoteMutation.mutateAsync({
            author,
            permlink,
            duration: actionSpecificParam,
          });
          break;

        case 'boost_plus':
          await boostPlusMutation.mutateAsync({
            account: author,
            duration: actionSpecificParam,
          });
          break;

        case 'boost':
          await boostMutation.mutateAsync({
            author,
            permlink,
            points: actionSpecificParam,
          });
          break;

        default:
          break;
      }

      this.setState({ isLoading: false });
      navigation.goBack();
      dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
    } catch (error) {
      this.setState({ isLoading: false });
      if (error?.message) {
        const msg = `${intl.formatMessage({ id: 'alert.key_warning' })}\n${error.message}`;
        dispatch(toastNotification(msg));
      }
    }
  };

  _handleOnSubmit = async (
    redeemType,
    actionSpecificParam,
    fullPermlinkOrUsername,
    selectedUser,
  ) => {
    const { intl, currentAccount, accounts } = this.props;
    let _author;
    let _permlink;

    if (redeemType !== 'boost_plus') {
      const separatedPermlink = fullPermlinkOrUsername.split('/');
      _author = get(separatedPermlink, '[0]');
      _permlink = get(separatedPermlink, '[1]');

      // Check if post is available using SDK
      const queryClient = getQueryClient();
      try {
        const post = await queryClient.fetchQuery(getPostQueryOptions(_author, _permlink, ''));
        const _isPostAvailable = post && post.post_id !== 0;

        if (!_isPostAvailable) {
          Alert.alert(intl.formatMessage({ id: 'alert.not_existing_post' }));
          return;
        }
      } catch {
        Alert.alert(intl.formatMessage({ id: 'alert.not_existing_post' }));
        return;
      }
    } else {
      _author = fullPermlinkOrUsername;
    }

    const user =
      selectedUser === currentAccount.name
        ? currentAccount
        : accounts.find((item) => item.username === selectedUser);

    this._redeemAction(user, redeemType, actionSpecificParam, _author, _permlink);
  };

  _handleOnSCModalClose = () => {
    this.setState({ isSCModalOpen: false, isLoading: false });
  };

  render() {
    const { children } = this.props;
    const { isLoading, isSCModalOpen, SCPath, actionSpecificParam } = this.state;

    return (
      children &&
      children({
        isLoading,
        isSCModalOpen,
        SCPath,
        handleOnSubmit: this._handleOnSubmit,
        actionSpecificParam,
        handleOnSCModalClose: this._handleOnSCModalClose,
      })
    );
  }
}

const mapStateToProps = (state) => ({
  username: selectCurrentAccount(state)?.name || '',
  activeBottomTab: state.ui.activeBottomTab,
  isConnected: selectIsConnected(state),
  accounts: selectOtherAccounts(state),
  currentAccount: selectCurrentAccount(state),
  isPinCodeOpen: selectIsPinCodeOpen(state),
  globalProps: selectGlobalProps(state),
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  const authContext = useAuthContext();
  const { currentAccount } = props;
  const promoteMutation = usePromoteMutation();
  const boostPlusMutation = useBoostPlusMutation();
  const boostMutation = useBroadcastMutation(
    ['ecency', 'boost'],
    currentAccount?.name,
    ({ author, permlink, points }: { author: string; permlink: string; points: number }) => [
      buildBoostOpWithPoints(currentAccount?.name, author, permlink, points),
    ],
    undefined,
    authContext,
    'active',
  );
  return (
    <RedeemContainer
      {...props}
      navigation={navigation}
      promoteMutation={promoteMutation}
      boostPlusMutation={boostPlusMutation}
      boostMutation={boostMutation}
    />
  );
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
