import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

const _dropShadow = {
  shadowOpacity: 0.1,
  shadowOffset: {
    width: 0,
    height: -3,
  },
  backgroundColor: '$primaryBackgroundColor',
  borderColor: '$primaryLightBackground',
  borderTopWidth: Platform.select({
    android: 1,
    ios: 0,
  }),
};

export default EStyleSheet.create({
  container: {
    width: '$deviceWidth',
    elevation: 3,
    backgroundColor: '$primaryBackgroundColor',
  },
  shadowedContainer: {
    elevation: 3,
    width: '$deviceWidth',
    ..._dropShadow,
  },
  dropShadow: {
    ..._dropShadow,
  },
  buttonsContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '$deviceWidth',
    backgroundColor: '$primaryBackgroundColor',
    borderColor: '$primaryLightBackground',
    paddingBottom: getBottomSpace(),
  },
  clearIcon: {
    color: '$primaryLightGray',
  },
  rightIcons: {
    marginRight: 20,
  },
  editorButton: {
    color: '$primaryDarkGray',
    marginRight: 15,
    height: 24,
  },
  leftButtonsWrapper: {
    marginLeft: 16,
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '$deviceWidth / 3',
  },
  rightButtonsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    color: '$editorButtonColor',
  },
  clearButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    width: 56,
    backgroundColor: '$primaryBlue',
  },
  indicator: {
    height: 8,
    width: 44,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
    margin: 8,
    alignSelf: 'center',
  },
});
