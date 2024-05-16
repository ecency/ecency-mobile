import { Platform, StatusBar } from 'react-native';
import getWindowDimensions from '../utils/getWindowDimensions';

export default {
  // Primary Colors
  $theme: 'darkTheme',
  $primaryBackgroundColor: '#1e2835',
  $primaryLightBackground: '#2e3d51',
  $primaryGrayBackground: '#1e2835',
  $primaryWhiteLightBackground: '#2e3d51',
  $darkGrayBackground: '#526d91',
  $modalBackground: '#1e2835',
  $white: '#1e2835',
  $black: '#000000',
  $primaryBlue: '#357ce6',
  $primaryDarkBlue: '#1a509a',
  $primaryLightBlue: '#2e3d51',
  $primaryLightBlue2: '#254c87',
  $primaryGray: '#f5f5f5',
  $primaryDarkGray: '#fcfcfc',
  $primaryLightGray: '#f6f6f6',
  $primaryRed: '#e63535',
  $primaryGreen: '#4FD688',
  $companyRed: '#c10000',
  $primaryBlack: '#fcfcfc',
  $primaryDarkText: '#fcfcfc',

  // General Colors
  $borderColor: '#c5c5c5',
  $tagColor: '#2e3d51',
  $bubblesBlue: '#5CCDFF',
  $borderTopColor: '#757575',
  $iconColor: '#788187',
  $darkIconColor: '#526d91',
  $dangerColor: '#fff',
  $warningColor: '#fff',
  $successColor: '#4BB543',
  $disableButton: '#fff',
  $shadowColor: '#80000000',
  $disableGray: '#fff',
  $editorButtonColor: '#fff',
  $pureWhite: '#ffffff',
  $notificationBorder: '#1e2835',
  $tableTrColor: '#2e3d51',
  $tableBorderColor: '#1e2835',
  $noConnectionColor: '#788187',
  $borderedButtonBlue: '#5CCDFF',

  $chartBlue: '#357CE6',
  $chartText: '#f5f5f5',

  // Devices Sizes
  $deviceHeight:
    Platform.OS === 'ios'
      ? getWindowDimensions().height
      : getWindowDimensions().height + StatusBar.currentHeight,
  $deviceWidth: getWindowDimensions().width,

  // Fonts Properties
  $primaryFont: 'Roboto',
  $editorFont: 'RobotoMono-Regular',
  $primaryLatterSpacing: 0,
};
