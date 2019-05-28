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
    alignItems: 'center',
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
  },
  postButton: {
    flex: 1,
    bottom: 25,
    backgroundColor: '#357ce6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '$shadowColor',
    shadowOffset: { height: 2 },
    shadowOpacity: 0.5,
    elevation: 3,
  },
});
