import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },

  bottomContent: {
    flex: 1,
    width: '100%',
  },
  scannerContainer: {
    flex: 1,
  },
  cameraContainer: {
    backgroundColor: 'black',
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
    alignSelf: 'center',
    justifyContent: 'center',
    width: 200,
  },
});
