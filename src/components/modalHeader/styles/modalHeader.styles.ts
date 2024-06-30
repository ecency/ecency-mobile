import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalHeader: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '$primaryBlack',
    flexGrow: 1,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  },
  closeButton: {
    marginRight: 24,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '$primaryBlack',
  },
  rightText: {
    color: '$primaryBlack',
    padding: 10,
  },
});
