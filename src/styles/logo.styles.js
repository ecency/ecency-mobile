import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: '$deviceWidth / 3',
    height: '$deviceHeight / 6',
    backgroundColor: 'transparent',
  },
});
