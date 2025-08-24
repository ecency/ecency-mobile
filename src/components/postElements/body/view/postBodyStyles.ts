import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  revealButton: {
    backgroundColor: '$iconColor',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 40,
    maxWidth: 170,
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
  imageGalleryHeaderText: {
    color: '$primaryDarkText',
  },
});
