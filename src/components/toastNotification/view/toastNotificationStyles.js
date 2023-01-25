import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    maxWidth: '$deviceWidth',
    minWidth: '$deviceWidth / 1.9',
    height: 44,
    borderRadius: 30,
    backgroundColor: '$darkGrayBackground',
    margin: 5,
    shadowOffset: {
      height: 5,
    },
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    elevation: 3,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 10,
    textAlign: 'center',
  },
});
