import { Dimensions, Platform, StatusBar } from 'react-native';

export default {
  // Primary Colors
  $theme: 'darkTheme',
  $primaryBackgroundColor: '#1e2835',
  $primaryLightBackground: '#2e3d51',
  $primaryGrayBackground: '#1e2835',
  $primaryWhiteLightBackground: '#2e3d51',
  $white: '#1e2835',
  $black: '#000000',
  $primaryBlue: '#357ce6',
  $primaryDarkBlue: '#1a509a',
  $primaryLightBlue: '#2e3d51',
  $primaryGray: '#f5f5f5',
  $primaryDarkGray: '#c1c5c7',
  $primaryLightGray: '#f6f6f6',
  $primaryRed: '#e63535',
  $companyRed: '#e63535',
  $primaryBlack: '#c1c5c7',
  $primaryDarkText: '#526d91',

  // General Colors
  $borderColor: '#c5c5c5',
  $tagColor: '#2e3d51',
  $bubblesBlue: '#5CCDFF',
  $borderTopColor: '#757575',
  $iconColor: '#788187',
  $darkIconColor: '#526d91',
  $dangerColor: '#fff',
  $warningColor: '#fff',
  $successColor: '#fff',
  $disableButton: '#fff',
  $shadowColor: '#80000000',
  $disableGray: '#fff',
  $editorButtonColor: '#fff',
  $pureWhite: '#ffffff',
  $notificationBorder: '#1e2835',
  $tableTrColor: '#2e3d51',
  $tableBorderColor: '#1e2835',
  $noConnectionColor: '#788187',

  // Devices Sizes
  $deviceHeight:
    Platform.OS === 'ios'
      ? Dimensions.get('window').height
      : Dimensions.get('window').height + StatusBar.currentHeight,
  $deviceWidth: Dimensions.get('window').width,

  // Fonts Properties
  $primaryFont: 'Roboto',
  $editorFont: 'RobotoMono-Regular',
  $primaryLatterSpacing: 0,
};
