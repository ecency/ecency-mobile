import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import { getPostQueryOptions } from '@ecency/sdk';
import {
  selectCurrentAccount,
  selectGlobalProps,
  selectPin,
  selectIsPinCodeOpen,
  selectOtherAccounts,
  selectIsConnected,
} from '../redux/selectors';
import {
  promote,
  boost,
  boostPlus,
  buildPromoteOpArr,
  buildBoostOpArr,
  buildBoostPlusOpArr,
} from '../providers/hive/dhive';
import { getQueryClient } from '../providers/queries';
import { toastNotification } from '../redux/actions/uiAction';
import { useActiveKeyOperation } from '../hooks';

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
    const { currentAccount, pinCode, dispatch, intl, navigation, executeOperation } = this.props;
    const account = user || currentAccount;
    const username = get(account, 'name');

    let action;
    let operations;

    // Build operations based on redeem type
    switch (redeemType) {
      case 'promote':
        action = promote;
        operations = buildPromoteOpArr(username, author, permlink, actionSpecificParam);
        break;

      case 'boost':
        action = boost;
        operations = buildBoostOpArr(username, actionSpecificParam, author, permlink);
        break;

      case 'boost_plus':
        action = boostPlus;
        operations = buildBoostPlusOpArr(username, actionSpecificParam, author);
        break;
      default:
        break;
    }

    this.setState({ isLoading: true });

    try {
      await executeOperation({
        operations,
        privateKeyHandler: () => action(account, pinCode, actionSpecificParam, author, permlink),
        callbacks: {
          onSuccess: () => {
            this.setState({ isLoading: false });
            navigation.goBack();
            dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
          },
          onError: (error) => {
            this.setState({ isLoading: false });
            dispatch(
              toastNotification(
                `${intl.formatMessage({ id: 'alert.key_warning' })}\n${error.message}`,
              ),
            );
          },
          onClose: () => {
            this.setState({ isLoading: false });
          },
        },
      });
    } catch (error) {
      // Error already handled in callbacks
      this.setState({ isLoading: false });
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
  pinCode: selectPin(state),
  isPinCodeOpen: selectIsPinCodeOpen(state),
  globalProps: selectGlobalProps(state),
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  const { executeOperation } = useActiveKeyOperation();
  return <RedeemContainer {...props} navigation={navigation} executeOperation={executeOperation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
