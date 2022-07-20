import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  stepOneContainer: {
    zIndex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  stepTwoContainer: {
    paddingVertical: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  stepThreeContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginVertical: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '$primaryBlack',
    // width: 172,
    flex: 1,
    minHeight: 35,
  },

  error: {
    borderWidth: 1,
    borderColor: 'red',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 10,
    color: '$primaryBlack',
    flex: 1,
    height: 75,
  },
  description: {
    color: '$iconColor',
  },
});
