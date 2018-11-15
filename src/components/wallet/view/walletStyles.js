import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingBottom: 20,
  },

  // First collabsible component
  mainButton: {
    marginBottom: 12,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },
  mainButtonText: {
    color: '$white',
    fontSize: 14,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  mainButtonWrapper: {
    flexDirection: 'row',
  },
  mainIconWrapper: {
    backgroundColor: '$white',
    justifyContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginLeft: 20,
    width: 24,
    height: 24,
  },
});
