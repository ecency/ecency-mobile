import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  centerModal: {
    height: 175,
    width: 275,
    borderRadius: 20,
  },
  fullModal: {
    height: '$deviceHeight',
    width: '$deviceWidth',
    flex: 1,
  },
  borderTopRadius: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
});
