import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  scrollContainer: {
    padding: 0,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  lastUpdateText: {
    color: '$iconColor',
    fontSize: 10,
  },
  dotStyle: {
    backgroundColor: '$primaryDarkText',
  },
  listWrapper: {
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
  },
  engineBtnContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
    marginVertical: 8,
  },
  engineBtnText: {
    color: '$primaryBlue',
  },
});
