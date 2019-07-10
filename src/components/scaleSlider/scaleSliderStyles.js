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
    width: 15,
    height: 15,
    borderColor: '#357ce6',
    borderRadius: 9,
    top: 12,
    borderWidth: 1,
    backgroundColor: '#357ce6',
    zIndex: 999,
  },
  passiveLine: {
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 17,
    borderColor: '#fff',
    borderWidth: 1,
    position: 'absolute',
    backgroundColor: '#fff',
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
});
