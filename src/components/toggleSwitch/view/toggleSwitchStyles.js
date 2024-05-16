import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    justifyContent: 'center',
    width: 68,
    borderRadius: 20,
    height: 35,
    padding: 12,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    backgroundColor: 'white',
    width: 28,
    marginLeft: 4,
    height: 28,
    borderRadius: 28 / 2,
    shadowOpacity: 0.2,
    shadowOffset: {
      height: 1.5,
    },
    elevation: 3,
  },
});