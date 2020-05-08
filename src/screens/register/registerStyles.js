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
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginRight: 10,
    bottom: 24,
    right: 24,
  },
  cancelButton: {
    marginRight: 10,
  },
  formWrapper: {
    marginHorizontal: 30,
    marginVertical: 10,
  },
  input: {
    color: '$primaryDarkText',
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
    height: 227,
  },
  titleText: {
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerButton: {
    marginRight: 19,
    alignSelf: 'center',
  },
  mainButton: {
    paddingRight: 20,
  },
});
