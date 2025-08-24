import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  codeBlock: {
    fontFamily: 'Courier',
    fontWeight: '500',
    marginLeft: 20,
    color: '$primaryDarkGray',
  },
  del: {
    backgroundColor: '#000000',
  },
  em: {
    fontStyle: 'italic',
  },
  strong: {
    fontWeight: 'bold',
  },
  text: {
    color: '#3c4449',
  },
  heading1: {
    fontSize: 32,
    color: '$primaryBlack',
  },
  heading2: {
    fontSize: 24,
    color: '$primaryBlack',
  },
  strikethrough: {
    textDecorationLine: 'line-through',
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
