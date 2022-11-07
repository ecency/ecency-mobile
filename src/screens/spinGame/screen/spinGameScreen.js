import React from 'react';

// Container
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import { SpinGameContainer, InAppPurchaseContainer } from '../../../containers';

import { SpinGame } from '../../../components';

const SpinGameScreen = gestureHandlerRootHOC(({ route }) => {
  return (
    <SpinGameContainer>
      {({ startGame, score, gameRight, nextDate, isLoading, statusCheck }) => (
        <InAppPurchaseContainer route={route} fetchData={statusCheck} skus={['499spins']}>
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
});

export { SpinGameScreen as SpinGame };
