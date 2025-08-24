import React, { Component } from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import get from 'lodash/get';
import { injectIntl } from 'react-intl';

import { useNavigation } from '@react-navigation/native';
import { promote, boost, isPostAvailable, boostPlus } from '../providers/hive/dhive';
import { toastNotification } from '../redux/actions/uiAction';

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
    this.setState({ isLoading: true });

    const { currentAccount, pinCode, dispatch, intl, navigation } = this.props;
    let action;
    let specificParams;
    let hiveActionId;

    switch (redeemType) {
      case 'promote':
        action = promote;
        specificParams = { author, permlink, duration: actionSpecificParam };
        hiveActionId = 'ecency_promote';
        break;

      case 'boost':
        action = boost;
        specificParams = { author, permlink, amount: `${actionSpecificParam.toFixed(3)} POINT` };
        hiveActionId = 'ecency_boost';
        break;

      case 'boost_plus':
        action = boostPlus;
        specificParams = { account: author, duration: actionSpecificParam };
        hiveActionId = 'ecency_boost_plus';
        break;
      default:
        break;
    }

    if (get(user, 'local.authType') === 'steemConnect') {
      const json = JSON.stringify({
        user: get(user, 'name'),
        ...specificParams,
      });

      const uri = `sign/custom-json?authority=active&required_auths=%5B%22${get(
        user,
        'name',
      )}%22%5D&required_posting_auths=%5B%5D&id=${hiveActionId}&json=${encodeURIComponent(json)}`;

      this.setState({
        isSCModalOpen: true,
        SCPath: uri,
      });

      return;
    }

    await action(user || currentAccount, pinCode, actionSpecificParam, author, permlink)
      .then(() => {
        navigation.goBack();
        dispatch(toastNotification(intl.formatMessage({ id: 'alert.successful' })));
      })
      .catch((error) => {
        if (error) {
          dispatch(
            toastNotification(
              `${intl.formatMessage({ id: 'alert.key_warning' })}\n${error.message}`,
            ),
          );
        }
      });

    this.setState({ isLoading: false });
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
      const _isPostAvailable = await isPostAvailable(_author, _permlink);

      if (!_isPostAvailable) {
        Alert.alert(intl.formatMessage({ id: 'alert.not_existing_post' }));
        return;
      }
    } else {
      _author = fullPermlinkOrUsername;
    }

    const user =
      selectedUser !== currentAccount.username
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
  username: state.account.currentAccount.name,
  activeBottomTab: state.ui.activeBottomTab,
  isConnected: state.application.isConnected,
  accounts: state.account.otherAccounts,
  currentAccount: state.account.currentAccount,
  pinCode: state.application.pin,
  isPinCodeOpen: state.application.isPinCodeOpen,
  globalProps: state.account.globalProps,
});

const mapHooksToProps = (props) => {
  const navigation = useNavigation();
  return <RedeemContainer {...props} navigation={navigation} />;
};

export default connect(mapStateToProps)(injectIntl(mapHooksToProps));
