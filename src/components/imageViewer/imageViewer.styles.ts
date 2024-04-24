import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  imageViewerHeaderContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  leftContainer: {
    position: 'absolute',
    flexDirection:'row',
    alignItems:'center',
    left: 8,
  },
  rightContainer: {
    position: 'absolute',
    flexDirection:'row',
    right: 8,
  },
  imageGalleryHeaderText: {
    color: '$iconColor',
    fontSize: 16
  },
});
