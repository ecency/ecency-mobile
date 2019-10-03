import React, { PureComponent, Fragment } from 'react';
import { RedeemContainer, PointsContainer } from '../../../containers';

import { Promote, PostBoost } from '../../../components';

class RedeemScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycle Functions

  // Component Functions

  render() {
    return (
      <Fragment>
        <PointsContainer>
          {({
            accounts,
            currentAccountName,
            balance,
            navigationParams,
            redeemType,
            getESTMPrice,
          }) => (
            <RedeemContainer>
              {({ handleOnSubmit, SCPath, isSCModalOpen, handleOnSCModalClose, isLoading }) => (
                <Fragment>
                  {redeemType === 'promote' && (
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
                  )}

                  {redeemType === 'boost' && (
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
                    />
                  )}
                </Fragment>
              )}
            </RedeemContainer>
          )}
        </PointsContainer>
      </Fragment>
    );
  }
}

export default RedeemScreen;
