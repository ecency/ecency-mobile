import React, { PureComponent } from 'react';

// Container
import { SpinGameContainer } from '../../../containers';

import { SpinGame } from '../../../components';

class FreeEstmScreen extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <SpinGameContainer>
        {({ spin, score, gameRight, nextDate }) => (
          <SpinGame score={score} spin={spin} gameRight={gameRight} nextDate={nextDate} />
        )}
      </SpinGameContainer>
    );
  }
}

export default FreeEstmScreen;
