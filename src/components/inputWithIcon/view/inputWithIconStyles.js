import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    borderRadius: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    flexDirection: 'row',
    backgroundColor: '$primaryGray',
    height: 60,
    borderBottomWidth: 2,
    justifyContent: 'space-between',
  },
  textInput: {
    height: 60,
    flex: 8,
  },
  icon: {
    flex: 1,
    fontSize: 25,
    justifyContent: 'center',
    alignSelf: 'center',
    color: '$iconColor',
  },
  left: {
    marginLeft: 15,
  },
  right: {
    marginRight: 10,
  },
});
