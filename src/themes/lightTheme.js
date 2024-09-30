import { Platform, StatusBar } from 'react-native';
import getWindowDimensions from '../utils/getWindowDimensions';

export default {
  // Primary Colors
  $theme: 'lightTheme',
  $primaryBackgroundColor: '#FFFFFF',
  $primaryLightBackground: '#f6f6f6',
  $primaryGrayBackground: '#f5f5f5',
  $primaryWhiteLightBackground: '#ffffff',
  $darkGrayBackground: '#788187',
  $modalBackground: '#ededed',
  $white: '#FFFFFF',
  $black: '#000000',
  $primaryBlue: '#357ce6',
  $primaryDarkBlue: '#1a509a',
  $primaryLightBlue: '#eaf2fc',
  $primaryLightBlue2: '#90b5eb',
  $primaryGray: '#f5f5f5',
  $primaryDarkGray: '#788187',
  $primaryLightGray: '#f6f6f6',
  $primaryRed: '#e63535',
  $primaryGreen: '#4FD688',
  $companyRed: '#c10000',
  $primaryBlack: '#3c4449',
  $primaryDarkText: '#788187',

  // General Colors
  $borderColor: '#c5c5c5',
  $tagColor: '#c1c5c7',
  $bubblesBlue: '#5CCDFF',
  $iconColor: '#c1c5c7',
  $darkIconColor: '#c1c5c7',
  $borderTopColor: '#cfcfcf',
  $dangerColor: '#fff',
  $warningColor: '#fff',
  $successColor: '#4BB543',
  $disableButton: '#fff',
  $shadowColor: '#b0b0b0',
  $disableGray: '#fff',
  $editorButtonColor: '#3c4449',
  $pureWhite: '#ffffff',
  $notificationBorder: '#fff',
  $tableTrColor: '#f5f5f5',
  $tableBorderColor: '#FFFFFF',
  $noConnectionColor: '#788187',
  $borderedButtonBlue: '#357ce6',

  $chartBlue: '#357CE6',
  $chartText: '#357ce6',

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
