import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 15,
  },
  wrapper: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  icon: {
    color: '$primaryGray',
    width: 16,
    fontSize: 16,
    height: 16,
  },
  iconTextWrapper: {
    // justifyContent: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  text: {
    flexDirection: 'row',

    color: '#3c4449',
    fontSize: 16,
    // justifyContent: 'flex-start',
  },
  rightText: {
    color: '#357ce6',
    fontSize: 14,
    fontWeight: '600',
    justifyContent: 'flex-end',
  },
});
