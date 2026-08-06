import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: 0.1,
    shadowOpacity: 0.2,
    elevation: 15,
    position: 'relative',
    overflow: 'visible',
    zIndex: 10,
  },
});
