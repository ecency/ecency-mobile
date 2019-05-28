import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  touchable: {
    maxWidth: '$deviceWidth',
    height: 56,
    borderRadius: 30,
    backgroundColor: '$primaryBlue',
    flexDirection: 'row',
    margin: 5,
    shadowOffset: {
      height: 5,
    },
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    elevation: 3,
  },
  icon: {
    alignSelf: 'center',
    fontSize: 25,
    marginLeft: 20,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    alignSelf: 'center',
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 20,
  },
  secondText: {
    fontWeight: 'bold',
  },
  activityIndicator: {
    minWidth: 56,
    height: 56,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginLeft: 20,
    alignSelf: 'center',
    width: 20,
    height: 20,
  },
  disableTouchable: {
    backgroundColor: '$iconColor',
  },
});
