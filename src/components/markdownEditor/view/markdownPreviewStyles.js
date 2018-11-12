import { StyleSheet } from 'react-native';

/**
 *
 */
const customMarkdownStyle = StyleSheet.create({
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
  },
  u: {
    borderColor: '#000000',
    borderBottomWidth: 1,
  },
});

export default customMarkdownStyle;
