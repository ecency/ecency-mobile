import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  textInput: {
    backgroundColor: '$white',
    borderRadius: 5,
  },
  searhItems: {
    marginHorizontal: 30,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '$primaryGray',
  },
  searchItemText: {
    color: '$white',
    marginLeft: 10,
  },
});
