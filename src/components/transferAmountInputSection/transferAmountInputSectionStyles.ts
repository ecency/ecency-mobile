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
    fontSize: 12,
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'right',
  },
  centerDescription: {
    marginTop: 8,
    fontSize: 12,
    color: '$primaryBlack',
    fontWeight: '600',
  },
  transferItemContainer: {
    height: 20,
  },
  transferItemRightStyle: {
    justifyContent: 'flex-end',
  },
  sectionHeading: {
    paddingHorizontal: 16,
    marginBottom: 0,
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    textAlign: 'left',
  },
  sectionSubheading: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
});
