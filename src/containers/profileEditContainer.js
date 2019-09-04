import { Component } from 'react';
import { connect } from 'react-redux';

// import ROUTES from '../constants/routeNames';

class ProfileEditContainer extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _handleOnSave = () => {};

  render() {
    const { children, currentAccount } = this.props;

    return (
      children &&
      children({
        currentAccount,
      })
    );
  }
}

const mapStateToProps = state => ({
  currentAccount: state.account.currentAccount,
});

export default connect(mapStateToProps)(ProfileEditContainer);
