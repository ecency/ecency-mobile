import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    width: '$deviceWidth',
    height: 50,
    backgroundColor: '$white',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hasTopBorder: {
    borderTopColor: '#cfcfcf',
    borderTopWidth: 1,
  },
  title: {
    alignSelf: 'center',
    color: '$primaryGray',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 32,
  },
  icon: {
    alignSelf: 'center',
    color: '#c1c5c7',
    fontSize: 18,
    marginRight: 32,
  },
});
