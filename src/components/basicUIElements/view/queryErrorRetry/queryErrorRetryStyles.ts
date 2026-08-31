import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  containerCompact: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  icon: {
    color: '$iconColor',
    marginBottom: 8,
  },
  message: {
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  messageCompact: {
    color: '$primaryDarkGray',
    fontFamily: '$primaryFont',
    fontSize: 13,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    backgroundColor: '$primaryBlue',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '$pureWhite',
    fontFamily: '$primaryFont',
    fontSize: 13,
    fontWeight: '600',
  },
});
