import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  active: {
    textAlign: 'center',
    fontSize: 17,
    bottom: 10,
    color: '#788187',
  },
  inactive: {
    flex: 1,
    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'normal',
    color: '#bdc3c7',
  },
  line: {
    width: 14,
    height: 14,
    backgroundColor: '#357ce6',
    borderRadius: 7,
    borderWidth: 0,
    top: 12,
    zIndex: 999,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  column: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    bottom: -20,
  },
  marker: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: 'white',
    borderWidth: 1,
    position: 'absolute',
    borderColor: '#357ce6',
  },
});
