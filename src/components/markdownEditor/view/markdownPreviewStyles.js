import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  view: {},
  codeBlock: {
    fontFamily: 'Courier',
    fontWeight: '500',
    marginLeft: 20,
    color: '#788187',
  },
  del: {
    backgroundColor: '#000000',
  },
  em: {
    fontStyle: 'italic',
  },

  text: {
    fontSize: 10,
    color: '#3c4449',
  },
  heading: {
    fontSize: 32,
    color: 'purple',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
    color: '#FF0000',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#a1c982',
  },
  u: {
    borderColor: '#000000',
    borderBottomWidth: 1,
  },
});
