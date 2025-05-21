import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    zIndex: 9999,
    marginHorizontal: 8,
    paddingTop: 16,
    backgroundColor: '$darkGrayBackground',
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 5,
    },
    elevation: 3,
    borderRadius: 12,
    width: '100% - 16',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 16,
  },
});
