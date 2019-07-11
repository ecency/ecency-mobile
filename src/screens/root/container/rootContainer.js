import React, { Component, Fragment } from 'react';
import { AppState, Platform, Linking, Alert } from 'react-native';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';

// Actions & Services
import { openPinCodeModal } from '../../../redux/actions/applicationActions';
import { getExistUser } from '../../../realm/realm';
import { getPost, getUser } from '../../../providers/steem/dsteem';

// Components
import { Modal } from '../../../components';
import { PinCode } from '../../pinCode';
import PostButtonForAndroid from '../../../components/postButton/view/postButtonsForAndroid';

// Constants
import ROUTES from '../../../constants/routeNames';

const RootContainer = () => WrappedComponent => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        wrappedComponentStates: null,
        appState: AppState.currentState,
      };
    }

    componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);

      Linking.getInitialURL().then(url => {
        this._handleDeepLink(url);
      });
      Linking.addEventListener('url', this._handleOpenURL);
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
      Linking.removeEventListener('url', this._handleOpenURL);
    }

    _handleOpenURL = event => {
      this._handleDeepLink(event.url);
    };

    _handleDeepLink = async url => {
      if (!url) return;

      let author;
      let permlink;
      let routeName;
      let params;
      let content;
      let profile;
      const { navigation, currentAccountUsername, intl } = this.props;

      if (
        url.indexOf('esteem') > -1 ||
        url.indexOf('steemit') > -1 ||
        url.indexOf('busy') > -1 ||
        url.indexOf('steempeak') > -1
      ) {
        url = url.substring(url.indexOf('@'), url.length);
        const routeParams = url.indexOf('/') > -1 ? url.split('/') : [url];

        [, permlink] = routeParams;
        author =
          routeParams && routeParams.length > 0 && routeParams[0].indexOf('@') > -1
            ? routeParams[0].replace('@', '')
            : routeParams[0];
      }

      if (author && permlink) {
        await getPost(author, permlink, currentAccountUsername)
          .then(result => {
            if (get(result, 'title')) {
              content = result;
            } else {
              this._handleAlert(
                intl.formatMessage({
                  id: 'deep_link.no_existing_post',
                }),
              );
            }
          })
          .catch(() => {
            this._handleAlert(
              intl.formatMessage({
                id: 'deep_link.no_existing_post',
              }),
            );
          });

        routeName = ROUTES.SCREENS.POST;
        params = { content };
      } else if (author) {
        profile = await getUser(author);

        if (!profile) {
          this._handleAlert(
            intl.formatMessage({
              id: 'deep_link.no_existing_user',
            }),
          );
          return;
        }

        routeName = ROUTES.SCREENS.PROFILE;
        params = { username: get(profile, 'name'), reputation: get(profile, 'reputation') };
      }

      if (routeName && (profile || content)) {
        this.navigationTimeout = setTimeout(() => {
          clearTimeout(this.navigationTimeout);
          navigation.navigate({
            routeName,
            params,
            key: permlink || author,
          });
        }, 2000);
      }
    };

    _handleAlert = (title = null, text = null) => {
      Alert.alert(title, text);
    };

    _handleAppStateChange = nextAppState => {
      const { appState } = this.state;

      getExistUser().then(isExistUser => {
        if (isExistUser) {
          if (appState.match(/active|forground/) && nextAppState === 'inactive') {
            this._startPinCodeTimer();
          }

          if (appState.match(/inactive|background/) && nextAppState === 'active') {
            clearTimeout(this._pinCodeTimer);
          }
        }
      });

      this.setState({ appState: nextAppState });
    };

    _startPinCodeTimer = () => {
      const { dispatch } = this.props;

      this._pinCodeTimer = setTimeout(() => {
        dispatch(openPinCodeModal());
      }, 1 * 60 * 1000);
    };

    _setWrappedComponentState = data => {
      this.setState({ wrappedComponentStates: { ...data } });
    };

    render() {
      const { isPinCodeReqiure, navigation } = this.props;
      const { wrappedComponentStates } = this.state;

      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
          >
            <PinCode
              setWrappedComponentState={this._setWrappedComponentState}
              navigation={navigation}
            />
          </Modal>
          <WrappedComponent {...this.props} {...wrappedComponentStates} />
          {Platform.OS === 'android' && <PostButtonForAndroid />}
        </Fragment>
      );
    }
  }
  const mapStateToProps = state => ({
    currentAccountUsername: state.account.currentAccount.name,
    isPinCodeReqiure: state.application.isPinCodeReqiure,
    isActiveApp: state.application.isActive,
  });

  return connect(mapStateToProps)(injectIntl(RootComponent));
};

export default RootContainer;
