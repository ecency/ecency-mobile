import EStyleSheet from 'react-native-extended-stylesheet';

export const getCheckBackground = (isCheck) =>
  EStyleSheet.create({
    backgroundColor: isCheck ? '$primaryBlue' : '#FFF',
  });

export default EStyleSheet.create({
  bigSquare: {
    height: 20,
    width: 20,
    borderWidth: 1,
    borderColor: '$primaryDarkGray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallSquare: {
    height: 10,
    width: 10,
  },
  checked: {
    backgroundColor: '$primaryBlue',
  },
});
