import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
  },
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
  },
  headerRow: {
    width: '$deviceWidth',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '$primaryBackgroundColor',
    paddingVertical: 8,
  },
  backIconContainer: {
    marginLeft: 20,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
  },
});
