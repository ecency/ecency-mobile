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
  mainButton: {
    marginTop: 16,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  mainButtonWrapper: {
    flexDirection: 'row',
  },
  openText: {
    color: '$pureWhite',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  urlContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  urlTextContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  validIcon: {
    width: 30,
  },
  cameraStyle: {
    width: '100%',
    height: '100%',
  },
});
