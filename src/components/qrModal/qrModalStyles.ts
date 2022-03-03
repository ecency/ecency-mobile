import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$black',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  container: {
    flex: 1,
  },
  mainContainer: {
    backgroundColor: '$black',
    height: '100%',
  },
  scannerContainer: {
    backgroundColor: '$black',
  },
  cameraContainer: {
    backgroundColor: '$black',
  },
  cameraStyle: {
    width: '100%',
    height: '100%',
  },
  activityIndicatorContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: {},
});
