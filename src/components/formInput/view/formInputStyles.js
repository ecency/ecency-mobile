import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginTop: 16,
    flexDirection: 'row',
    backgroundColor: '$primaryGray',
    height: 60,
    borderBottomWidth: 2,
  },
  firstImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    top: 15,
    marginLeft: 12,
  },
  textInput: {
    flex: 0.7,
    flexDirection: 'row',
  },
  icon: {
    flex: 0.15,
    fontSize: 25,
    top: 18,
    left: 8,
    color: '$iconColor',
  },
});
