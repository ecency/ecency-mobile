import React from 'react';

// Container
import { SpinGameContainer, InAppPurchaseContainer } from '../../../containers';

import { SpinGame } from '../../../components';

const SpinGameScreen = () => {
  return (
    <SpinGameContainer>
      {({ startGame, score, gameRight, nextDate, isLoading, statusCheck }) => (
        <InAppPurchaseContainer fetchData={statusCheck} skus={['499spins']}>
          {({ buyItem, getItems, spinProduct, isProcessing }) => (
            <SpinGame
              buyItem={buyItem}
              isLoading={isLoading}
              score={score}
              startGame={startGame}
              gameRight={gameRight}
              nextDate={nextDate}
              getItems={getItems}
              isProcessing={isProcessing}
              spinProduct={spinProduct}
            />
          )}
        </InAppPurchaseContainer>
      )}
    </SpinGameContainer>
  );
};

export { SpinGameScreen as SpinGame };
