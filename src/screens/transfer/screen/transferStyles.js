import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    justifyContent: 'center',
  },
  topContent: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContent: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContent: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 10,
    padding: 10,
    color: '$primaryBlack',
  },
  description: {
    color: '$iconColor',
  },
  button: {
    width: '$deviceWidth / 3',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 10,
    flex: 1,
    padding: 10,
  },
  icon: {
    fontSize: 40,
    color: '$iconColor',
    marginHorizontal: 20,
  },
});
