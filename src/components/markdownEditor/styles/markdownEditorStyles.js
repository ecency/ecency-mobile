import EStyleSheet from 'react-native-extended-stylesheet';
import { Platform } from 'react-native';
import isAndroidOreo from '../../../utils/isAndroidOreo';

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '$primaryBackgroundColor',
  },
  textWrapper: {
    flex: 1,
    fontSize: 14,
    paddingTop: isAndroidOreo() ? 6 : 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
    color: '$primaryBlack',
    backgroundColor: '$primaryBackgroundColor',
    textAlignVertical: 'top',
    minHeight: isAndroidOreo() ? undefined : '$deviceHeight/2',
    maxHeight: isAndroidOreo() ? '$deviceHeight' : undefined,
  },
  previewContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  inlinePadding: {
    padding: 8,
  },
  dropdownStyle: {
    marginRight: 8,
  },
  dropdownIconStyle: {
    color: '$primaryDarkGray',
  },
  icon: {
    color: '$editorButtonColor',
  },
  iconArrow: {
    marginLeft: 4,
    color: '$iconColor',
  },
  replySection: {
    paddingTop: 10,
    paddingBottom: 0,
  },
  accountTile: {
    height: 60,
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatarAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 2,
  },
  name: {
    marginLeft: 4,
    color: '$primaryDarkGray',
  },
  modalStyle: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 16,
  },
  floatingContainer: Platform.select({
    // absolute positioning makes button hide behind keyboard on ios
    ios: {
      alignItems: 'flex-end',
      margin: 16,
      marginBottom: 24,
    },
    // on android the appearing of button was causing momentary glitch with ios variant style
    android: {
      position: 'absolute',
      right: 16,
      bottom: 56,
    },
  }),
  searchAccountsContainer: Platform.select({
    // absolute positioning makes button hide behind keyboard on ios
    ios: {
      marginBottom: 12,
      paddingTop: 8,
    },
    // on android the appearing of button was causing momentary glitch with ios variant style
    android: {
      position: 'absolute',
      bottom: 56,
    },
  }),
  userBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
    backgroundColor: '$primaryBlue',
    borderRadius: 24,
  },
  userBubbleText: {
    fontSize: 16,
    color: '$white',
    marginLeft: 6,
    marginRight: 8,
  },
});
