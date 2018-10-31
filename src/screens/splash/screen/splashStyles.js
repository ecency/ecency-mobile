import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: '$primaryFont',
    color: '$primaryDarkBlue',
    fontSize: 30,
    paddingBottom: 0,
  },
  subTitle: {
    fontFamily: '$primaryFont',
    color: '#00519c',
    fontSize: 24,
    marginTop: -5,
  },
  logo: {
    width: '$deviceWidth / 4',
    height: '$deviceWidth / 4',
  },
});
