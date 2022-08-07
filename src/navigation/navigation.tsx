import React from 'react';

import { NavigationContainer } from '@react-navigation/native';

// Screens
import { StackNavigator } from './stackNavigator';


export const initAppNavigation = () => {

  //TOOD: read state for setting appropriate navigation mode like login/register etc

  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  )
}

