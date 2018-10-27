import React, { Component, Fragment } from 'react';
import { Text } from 'react-native';
import { connect } from 'react-redux';
import { Modal } from '../../../components';
import { PinCode } from '../..';

const RootContainer = () => (WrappedComponent) => {
  class RootComponent extends Component {
    constructor(props) {
      super(props);
      this.state = {};
    }

    componentWillMount() {
      console.log('============111111============', this.props);
    }

    render() {
      const { isPinCodeReqiure } = this.props;

      const cloneProps = Object.assign({}, this.props);
      delete cloneProps.dispatch;
      delete cloneProps.isPinCodeReqiure;
      delete cloneProps.navigation;

      return (
        <Fragment>
          <Modal
            isOpen={isPinCodeReqiure}
            isFullScreen
            swipeToClose={false}
            backButtonClose={false}
          >
            <PinCode />
          </Modal>
          <WrappedComponent {...cloneProps} />
        </Fragment>
      );
    }
  }
  const mapStateToProps = state => ({
    isPinCodeReqiure: state.ui.isPinCodeReqiure,
  });

  return connect(mapStateToProps)(RootComponent);
};

export default RootContainer;
