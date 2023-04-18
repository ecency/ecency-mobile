import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  body: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 80,
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
    backgroundColor: '$primaryBackgroundColor',
    justifyContent: 'space-between',
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
  mascot: {
    width: 160,
    height: 127,
  },
  titleText: {
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 32,
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
  mainButton: {
    paddingRight: 20,
  },
});
