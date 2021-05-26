import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    justifyContent: 'flex-end',
    alignSelf: 'center',
    maxWidth: '$deviceWidth',
    minWidth: '$deviceWidth / 1.9',
    height: 100,
    width:'100%',
    backgroundColor: '$primaryDarkText',
    margin: 5,
    shadowOffset: {
      height: 5,
    },
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    elevation: 3,
    marginTop:-4
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingRight: 10,
  },
});
