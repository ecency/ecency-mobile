import { TextStyle, ViewStyle } from 'react-native';
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
  transactionBodyContainer: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
  } as ViewStyle,
  transactionRow: {
    borderColor: 'red',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  } as ViewStyle,
  transactionItem1: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  } as TextStyle,
  transactionItem2: {
    color: '$primaryBlack',
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  } as TextStyle,
});
