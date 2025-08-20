import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '$deviceWidth / 1.8',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lastButtonGroup: {
    width: '63%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'flex-end',
  },
  iconButton: {
    fontSize: 25,
    color: '$primaryBlue',
  },
  buttonWithoutBorder: {
    borderWidth: 0,
    backgroundColor: 'transparent',
    width: '$deviceWidth / 7',
    height: '$deviceWidth / 7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    borderColor: 'rgba(53, 124, 230, 0.2)',
    marginBottom: 10,
  },
});
