import EStyleSheet from 'react-native-extended-stylesheet';
import isAndroidOreo from '../../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  selectCommunityAreaViewContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingTop: isAndroidOreo() ? 0 : 8,
    paddingBottom: isAndroidOreo() ? 4 : 8,
  },
  chooseACommunityText: {
    marginHorizontal: 8,
    color: '$primaryBlack',
  },
  icon: {
    color: '$iconColor',
  },
});
