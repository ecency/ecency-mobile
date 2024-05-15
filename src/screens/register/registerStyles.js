import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  body: {
    backgroundColor: '$primaryBackgroundColor',
  },

  cancelButton: {
    marginRight: 10,
  },
  formWrapper: {
    marginHorizontal: 30,
    marginVertical: 10,
    flex: 1,
  },
  input: {
    color: '$primaryDarkText',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '$primaryBackgroundColor',
    height: '$deviceHeight / 5',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  description: {
    textAlignVertical: 'center',
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: '400',
  },
  title: {
    textAlignVertical: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    marginBottom: 16,
  },
  mascotContainer: {
    flex: 1,
  },
  mascot: {
    marginTop: 4,
    width: '90%',
    height: '90%',
  },
  titleText: {
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 32,
    marginRight: 12,
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    height: '$deviceHeight / 10',
    justifyContent: 'space-between',
  },
  headerButton: {
    marginRight: 19,
    alignSelf: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 32,
    alignSelf: 'center',
  },
  footerButtons: {},
  mainButton: {},
  mainBtnWrapper: {
    marginVertical: 12,
  },
  mainBtnBodyWrapper: {
    flex: 1,
  },
  loginBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doYouHaveTxt: {
    color: '$primaryDarkGray',
    fontSize: 16,
  },
  loginBtnTxt: {
    color: '$primaryBlue',
    marginLeft: 4,
    fontSize: 16,
  },
});
