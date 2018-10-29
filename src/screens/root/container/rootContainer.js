import React, { Component, Fragment } from 'react';
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
          <WrappedComponent {...this.props} />
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
