import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
    marginBottom: 4,
  } as ViewStyle,

  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '$primaryBlue',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  } as ViewStyle,

  playIcon: {
    color: '$pureWhite',
  } as TextStyle,

  waveArea: {
    flex: 1,
    height: 34,
    justifyContent: 'center',
  } as ViewStyle,

  fallbackTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '$borderColor',
    overflow: 'hidden',
  } as ViewStyle,

  fallbackFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  time: {
    marginLeft: 10,
    minWidth: 34,
    textAlign: 'right',
    color: '$primaryBlack',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  // Audio-only: the Video element is mounted but not shown.
  hiddenVideo: {
    width: 0,
    height: 0,
  } as ViewStyle,
});
