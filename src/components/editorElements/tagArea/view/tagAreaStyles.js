import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  textInput: {
    color: '$white',
    fontSize: 10,
    backgroundColor: '#c1c5c7',
    borderRadius: 50,
    maxHeight: 18,
    padding: 5,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  tagWrapper: {
    flexDirection: 'row',
    marginTop: 14,
  },
  firstTag: {
    backgroundColor: '$primaryBlue',
  },
});
