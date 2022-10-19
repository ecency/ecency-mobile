import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
  },
  backIcon: {
    fontSize: 24,
    color: '#c1c5c7', // avoiding dark theme based color for web browser
  },
  header: {
    padding: 16,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: EStyleSheet.hairlineWidth,
    borderColor: '#c1c5c7',
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#c1c5c7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
