import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    backgroundColor: '$white',
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'column',
    fontSize: 12,
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  inlinePadding: {
    padding: 8,
  },
  editorButtons: {
    flexDirection: 'row',
    backgroundColor: '$white',
    alignItems: 'center',
    height: 48,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
  },
});
