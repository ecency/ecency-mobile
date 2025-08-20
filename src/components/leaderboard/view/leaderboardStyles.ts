import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  title: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 20,
    fontFamily: '$primaryFont',
    paddingBottom: 10,
    flexGrow: 1,
    textAlign: 'left',
  },
  rewardText: {
    color: '$primaryBlue',
  },
  columnTitleWrapper: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'flex-end',
  },
  columnTitle: {
    color: '$primaryDarkGray',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 40,
    marginBottom: 10,
    fontFamily: '$primaryFont',
    textAlign: 'left',
  },
  listContentContainer: {
    paddingBottom: 60,
  },
});
