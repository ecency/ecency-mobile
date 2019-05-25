import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';

export default EStyleSheet.create({
  container: {
    flexDirection: 'row',
    width: '$deviceWidth',
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
    maxHeight: Platform.OS === 'ios' ? 95 : 80,
  },
  containerReverse: {
    justifyContent: 'space-between',
    flexDirection: 'row-reverse',
  },
  avatarWrapper: {
    justifyContent: 'center',
  },
  avatarButtonWrapperReverse: {
    borderTopLeftRadius: 68 / 2,
    borderBottomLeftRadius: 68 / 2,
  },
  avatarButtonWrapper: {
    backgroundColor: '#357ce6',
    height: 50,
    width: 68,
    justifyContent: 'center',
  },
  avatarDefault: {
    borderTopRightRadius: 68 / 2,
    borderBottomRightRadius: 68 / 2,
  },
  titleWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '$primaryDarkText',
  },
  noAuthTitle: {
    fontSize: 14,
    color: '$iconColor',
  },
  subTitle: {
    color: '$primaryDarkText',
    fontSize: 12,
  },
  avatar: {
    alignSelf: 'flex-end',
    marginRight: 12,
  },
  reverseAvatar: {
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  backIcon: {
    fontSize: 24,
    color: '$iconColor',
    justifyContent: 'center',
  },
  backButton: {
    marginLeft: 24,
  },
  backButtonWrapper: {
    flexGrow: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});
