import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  subButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#357ce6',
  },
  subButtonWrapper: {
    position: 'absolute',
  },
  postButtonWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  postButton: {
    bottom: 25,
    backgroundColor: '#357ce6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '$shadowColor',
    shadowOffset: { height: 0 },
    shadowOpacity: 1,
  },
});
