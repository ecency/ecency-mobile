import React from 'react';

import { get } from 'lodash';
import { ChatContextProvider } from '@ecency/ns-query';
import ApplicationContainer from './container/applicationContainer';
import ApplicationScreen from './children/applicationScreen';
import ErrorBoundary from './children/errorBoundary';
import { useInitApplication } from './hook/useInitApplication';
import { useAppSelector } from '../../hooks.ts';
import defaults from '../../constants/defaults.json';

const Application = () => {
  // New hook to handle all custom app initializations
  // it will help clean index.tsx stay clean and completely discard ApplicationContainer moving forward
  useInitApplication();

  const activeUserData = useAppSelector((state) => state.account.currentAccount);
  const accessToken =
    'eyJzaWduZWRfbWVzc2FnZSI6eyJ0eXBlIjoicG9zdGluZyIsImFwcCI6ImVjZW5jeS5hcHAifSwiYXV0aG9ycyI6WyJreWl2bHlhbmluIl0sInRpbWVzdGFtcCI6MTcxMjY3NzQzMSwic2lnbmF0dXJlcyI6WyIyMDNlMDE1OGQwZjUyMzFmNTk2ZWIzOThlYzQ1NjFjNGY4MzFjMTU1N2MzMjY3OWI2ZDVmMmU4ZDUzNTIzZWM4ZDYxNjY4Y2MwYjE3YTRmMmQ0NDQxZjY0NGVlYzYxZTkzZWZiNjg5OTQ4ZWUwNDA3ZTc0NWY5MTlmYTQxODNjYWNhIl19';

  return (
    <>
      <ChatContextProvider
        privateApiHost={defaults.base}
        activeUsername={activeUserData?.username}
        activeUserData={activeUserData}
        ecencyAccessToken={accessToken}
      >
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
      </ChatContextProvider>
    </>
  );
};

export default Application;

export { ApplicationContainer, ApplicationScreen };
