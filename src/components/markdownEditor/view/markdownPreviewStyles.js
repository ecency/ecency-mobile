import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  view: {},
  codeBlock: {
    fontFamily: 'Courier',
    fontWeight: '500',
  },
  del: {
    backgroundColor: '#000000',
  },
  em: {
    fontStyle: 'italic',
  },

  text: { fontSize: 10, color: '#a1c982' },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#FF0000',
  },
  a: {
    textDecorationLine: 'underline',
    color: 'red',
    backgroundColor: 'black',
  },
  u: {
    borderColor: '#000000',
    borderBottomWidth: 1,
  },
});
