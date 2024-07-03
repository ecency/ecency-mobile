import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  choiceWrapper: {
    marginBottom: 8,
  },
  progressBar: {
    borderRadius: 12,
    borderWidth: 2,
    alignSelf: 'stretch',
    marginHorizontal: 8,
  } as ViewStyle,
  progressBarCompact: {
    marginHorizontal: 0,
    marginRight:8
  } as ViewStyle,
  progressContentWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  choiceLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  } as ViewStyle,
  label: {
    marginLeft: 8,
    fontSize: 12,
    color: '$primaryBlack',
    flexShrink: 1,
  } as TextStyle,
  count: {
    fontSize: 12,
    marginLeft: 8,
    color: '$primaryDarkGray',
  } as TextStyle,
  checkContainerStyle: {
    backgroundColor: '$white',
  } as ViewStyle,
});
