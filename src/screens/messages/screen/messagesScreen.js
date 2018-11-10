import React, { Component, Fragment } from 'react';

// Constants

// Components
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';

// Styles
import styles from './messagesStyle';
import MESSAGES_IMAGE from '../../../assets/keep_calm.png';

class MessagesScreen extends Component {
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

  render() {
    return (
      <Fragment>
        <Header />
        <NoPost
          style={styles.container}
          imageStyle={styles.image}
          source={MESSAGES_IMAGE}
          defaultText="Messages feature is coming soon!"
        />
      </Fragment>
    );
  }
}

export default MessagesScreen;
