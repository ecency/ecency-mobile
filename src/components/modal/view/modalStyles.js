import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  centerModal: {
    height: 175,
    width: 275,
    borderRadius: 20,
  },
  fullModal: {
    flex: 1,
  },
  borderTopRadius: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  modalHeader: {
    backgroundColor: '$primaryBackgroundColor',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '$primaryBlack',
    flexGrow: 1,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    marginLeft: 50,
    fontWeight: '500',
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
  safeArea: {
    backgroundColor: '$primaryBackgroundColor',
  },
});
