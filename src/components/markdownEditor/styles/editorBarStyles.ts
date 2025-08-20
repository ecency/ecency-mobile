import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    alignItems: 'center',
    height: 48,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
    elevation: 3,
  },
});
