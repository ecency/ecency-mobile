import React, { Component, Fragment } from 'react';
import { AppState } from 'react-native';
import { connect } from 'react-redux';

// Actions
import { openPinCodeModal } from '../../../redux/actions/applicationActions';

// Components
import { Modal } from '../../../components';
import { PinCode } from '../..';

const RootContainer = () => (WrappedComponent) => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        pinCodeStates: null,
        wrappedComponentStates: null,
        appState: AppState.currentState,
      };
    }

    componentDidMount() {
      AppState.addEventListener('change', this._handleAppStateChange);
    }

    componentWillUnmount() {
      AppState.removeEventListener('change', this._handleAppStateChange);
    }

    _handleAppStateChange = (nextAppState) => {
      const { appState } = this.state;
      const { dispatch } = this.props;

      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        dispatch(openPinCodeModal());
      }
      this.setState({ appState: nextAppState });
    };

    _setPinCodeState = (data) => {
      this.setState({ pinCodeStates: { ...data } });
    };

    _setWrappedComponentState = (data) => {
      this.setState({ wrappedComponentStates: { ...data } });
    };

    render() {
      const { isPinCodeReqiure, navigation } = this.props;
      const { pinCodeStates, wrappedComponentStates } = this.state;
      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
          >
            <PinCode
              {...pinCodeStates}
              setWrappedComponentState={this._setWrappedComponentState}
              navigation={navigation}
            />
          </Modal>
          <WrappedComponent
            {...this.props}
            {...wrappedComponentStates}
            setPinCodeState={this._setPinCodeState}
          />
        </Fragment>
      );
    }
  }
  const mapStateToProps = state => ({
    isPinCodeReqiure: state.application.isPinCodeReqiure,
  });

  return connect(mapStateToProps)(RootComponent);
};

export default RootContainer;
