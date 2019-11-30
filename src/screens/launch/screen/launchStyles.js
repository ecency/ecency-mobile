import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$pureWhite',
    zIndex: 999,
  },
  darkContainer: {
    flex: 1,
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e2835',
  },
});
