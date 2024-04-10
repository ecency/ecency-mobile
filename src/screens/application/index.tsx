import React from 'react';

import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import { useInitApplication } from './hook/useInitApplication';
import {ChatContextProvider} from "@ecency/ns-query";
import {useAppSelector} from "../../hooks.ts";
import {get} from "lodash";

import defaults from "../../constants/defaults.json";

const Application = () => {
  // New hook to handle all custom app initializations
  // it will help clean index.tsx stay clean and completely discard ApplicationContainer moving forward
  useInitApplication();

  const activeUserData = useAppSelector((state) => state.account.currentAccount)
  const accessToken = get(activeUserData, 'local.accessToken');

  return (
      <>
        <ChatContextProvider
            privateApiHost={defaults.base}
            activeUsername={activeUserData?.username}
            activeUserData={activeUserData}
            ecencyAccessToken={accessToken}
        />

      <ApplicationContainer>
        {({ isRenderRequire, foregroundNotificationData }) => {
          return (
            <ErrorBoundary>
              {isRenderRequire && (
                <ApplicationScreen foregroundNotificationData={foregroundNotificationData} />
              )}
            </ErrorBoundary>
          );
        }}
      </ApplicationContainer>
      </>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
