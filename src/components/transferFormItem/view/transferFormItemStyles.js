import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 40,
    marginVertical: 8,
  },
  leftPart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    color: '$primaryBlack',
    height: 40,
  },
  text: {
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  rightPart: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
