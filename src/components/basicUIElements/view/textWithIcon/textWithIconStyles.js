import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    margin: 5,
  },
  wrapper: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  icon: {
    color: '$iconColor',
    fontSize: 12,
    marginRight: 3,
  },
  text: {
    color: '$iconColor',
    alignSelf: 'center',
    fontSize: 11,
  },
});
