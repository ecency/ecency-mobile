import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  inputWrapper: {
    backgroundColor: '$primaryLightBackground',
    flexDirection: 'row',
    height: 44,
    margin: 16,
    borderRadius: 8,
    marginTop: 5,
    padding: 5,
    justifyContent: 'center',
  },
  safeArea: {
    marginTop: 20,
  },
  icon: {
    alignSelf: 'center',
    color: '$iconColor',
    marginLeft: 16,
  },
  input: {
    color: '$primaryDarkGray',
    fontSize: 14,
    flexGrow: 1,
    padding: 7,
    maxWidth: '$deviceWidth - 100',
  },
  closeIconButton: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    justifyContent: 'center',
    alignSelf: 'center',
    marginRight: 16,
  },
  closeIcon: {
    color: '$iconColor',
    fontSize: 22,
  },
  body: {
    marginRight: 24,
    flex: 1,
  },
  searchItems: {
    marginHorizontal: 30,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchItemImageWrapper: {
    flex: 2,
  },
  searchItemTextWrapper: {
    flex: 10,
  },
  searchItemTextGap: {
    paddingTop: 15,
    color: '$pureWhite',
    marginLeft: 10,
  },
  searchItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '$primaryGray',
  },
  searchItemText: {
    color: '$pureWhite',
    marginLeft: 10,
  },
});
