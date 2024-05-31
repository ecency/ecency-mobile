import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { gestureHandlerRootHOC } from 'react-native-gesture-handler';
import Animated, { SlideInRight } from 'react-native-reanimated';
import { RedeemContainer, PointsContainer } from '../../../containers';

import { Promote, PostBoost } from '../../../components';
import BoostPlus from '../children/boostPlus';
import styles from '../styles/redeemScreen.styles';

class RedeemScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    const { route } = this.props;
    return (
      <View style={styles.container}>
        <PointsContainer route={route}>
          {({
            accounts,
            currentAccountName,
            balance,
            navigationParams,
            redeemType,
            getESTMPrice,
            user,
          }) => (
            <RedeemContainer>
              {({ handleOnSubmit, SCPath, isSCModalOpen, handleOnSCModalClose, isLoading }) => {
                let _retView = null;
                switch (redeemType) {
                  case 'promote':
                    _retView = (
                      <Promote
                        isLoading={isLoading}
                        accounts={accounts}
                        currentAccountName={currentAccountName}
                        balance={balance}
                        navigationParams={navigationParams}
                        handleOnSubmit={handleOnSubmit}
                        redeemType={redeemType}
                        isSCModalOpen={isSCModalOpen}
                        handleOnSCModalClose={handleOnSCModalClose}
                        SCPath={SCPath}
                        getESTMPrice={getESTMPrice}
                      />
                    );
                    break;
                  case 'boost':
                    _retView = (
                      <PostBoost
                        isLoading={isLoading}
                        accounts={accounts}
                        currentAccountName={currentAccountName}
                        balance={balance}
                        navigationParams={navigationParams}
                        handleOnSubmit={handleOnSubmit}
                        redeemType={redeemType}
                        isSCModalOpen={isSCModalOpen}
                        handleOnSCModalClose={handleOnSCModalClose}
                        SCPath={SCPath}
                        getESTMPrice={getESTMPrice}
                        user={user}
                      />
                    );
                    break;
                  case 'boost_plus':
                    _retView = (
                      <BoostPlus
                        isLoading={isLoading}
                        accounts={accounts}
                        currentAccountName={currentAccountName}
                        balance={balance}
                        navigationParams={navigationParams}
                        handleOnSubmit={handleOnSubmit}
                        redeemType={redeemType}
                        isSCModalOpen={isSCModalOpen}
                        handleOnSCModalClose={handleOnSCModalClose}
                        SCPath={SCPath}
                        getESTMPrice={getESTMPrice}
                      />
                    );
                    break;
                }

                return (
                  <Animated.View style={StyleSheet.absoluteFill} entering={SlideInRight}>
                    {_retView}
                  </Animated.View>
                );
              }}
            </RedeemContainer>
          )}
        </PointsContainer>
      </View>
    );
  }
}

export default gestureHandlerRootHOC(RedeemScreen);
