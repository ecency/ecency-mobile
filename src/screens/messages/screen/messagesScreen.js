import React, { PureComponent, Fragment } from 'react';
import { injectIntl } from 'react-intl';

// Constants

// Components
import { Header } from '../../../components/header';
import { NoPost } from '../../../components/basicUIElements';

// Styles
import styles from './messagesStyle';
import MESSAGES_IMAGE from '../../../assets/keep_calm.png';

class MessagesScreen extends PureComponent {
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
    const { intl } = this.props;

    return (
      <Fragment>
        <Header />
        <NoPost
          style={styles.container}
          imageStyle={styles.image}
          source={MESSAGES_IMAGE}
          defaultText={intl.formatMessage({
            id: 'messages.comingsoon',
          })}
        />
      </Fragment>
    );
  }
}

export default injectIntl(MessagesScreen);
