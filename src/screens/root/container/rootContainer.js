import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Modal } from '../../../components';
import { PinCode } from '../..';

const RootContainer = () => (WrappedComponent) => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {
        pinCodeStates: null,
        wrappedComponentStates: null,
      };
    }

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
