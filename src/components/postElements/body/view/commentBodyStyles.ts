import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  revealButton: {
    backgroundColor: '$iconColor',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 40,
    maxWidth: 170,
    marginVertical: 12,
    paddingVertical: 6,
  },
  revealText: {
    color: '$white',
    fontSize: 14,
  },
  imageViewerHeaderContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  closeIconButton: {
    position: 'absolute',
    right: 0,
  },
});
