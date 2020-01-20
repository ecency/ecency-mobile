import React, { useState } from 'react';
import { View, Button } from 'react-native';
import Rate, { AndroidMarket } from 'react-native-rate';

const rateScreen = () => {
  const [rated, setRated] = useState(false);

  return (
    <View>
      <Button
        title="Rate App"
        onPress={() => {
          const options = {
            AppleAppID: '1451896376',
            GooglePackageName: 'app.esteem.mobile.android',
            AmazonPackageName: 'app.esteem.mobile.android',
            OtherAndroidURL: 'https://esteem.app',
            preferredAndroidMarket: AndroidMarket.Google,
            preferInApp: false,
            openAppStoreIfInAppFails: true,
            fallbackPlatformURL: 'https://esteem.app',
          };
          Rate.rate(options, success => {
            if (success) {
              setRated(true);
            }
          });
        }}
      />
    </View>
  );
};

export default rateScreen;
