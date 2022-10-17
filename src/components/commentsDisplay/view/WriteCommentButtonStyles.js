import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    padding: 16,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  inputContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    height: 36,
    borderRadius: 12,
    flex: 1,
    backgroundColor: '$primaryLightBackground',
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$primaryDarkGray',
  },
  inputPlaceholder: {
    color: '$primaryDarkGray',
    fontSize: 16,
    marginTop: 5,
    paddingHorizontal: 16,
  },
});
