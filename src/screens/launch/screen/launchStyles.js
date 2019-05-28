import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
  },
  title: {
    fontFamily: 'Sansation_Bold',
    color: '$primaryDarkBlue',
    fontSize: 30,
    paddingBottom: 0,
  },
  subTitle: {
    fontFamily: 'Sansation_Regular',
    color: '#00519c',
    fontSize: 24,
  },
  logo: {
    width: '$deviceWidth / 4',
    height: '$deviceWidth / 4',
  },
});
