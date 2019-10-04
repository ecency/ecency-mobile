import React, { PureComponent } from 'react';

// Container
import { SpinGameContainer, InAppPurchaseContainer } from '../../../containers';

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
        {({ startGame, score, gameRight, nextDate, isLoading }) => (
          <InAppPurchaseContainer skus={['499spins']}>
            {({ buyItem, getItems, spinProduct }) => (
              <SpinGame
                buyItem={buyItem}
                isLoading={isLoading}
                score={score}
                startGames={startGame}
                gameRight={gameRight}
                nextDate={nextDate}
                getItems={getItems}
                spinProduct={spinProduct[0]}
              />
            )}
          </InAppPurchaseContainer>
        )}
      </SpinGameContainer>
    );
  }
}

export default FreeEstmScreen;
