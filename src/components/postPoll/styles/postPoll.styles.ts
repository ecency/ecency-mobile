import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$iconColor',
    padding: 8,
  } as ViewStyle,
  compactContainer: {
    paddingBottom: 8,
    paddingRight: 8,
  } as ViewStyle,
  question: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
  } as TextStyle,
  countdonw: {
    fontSize: 12,
    color: '$primaryBlack',
  } as TextStyle,
  optionsTextWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,
  authorPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  } as ViewStyle,
  actionPanel: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  } as ViewStyle,
  voteButton: {
    width: 140,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  voteButtonCompact: {
    height: 32,
  } as ViewStyle,
  viewVotesBtn: {
    color: '$primaryDarkGray',
    fontSize: 14,
    marginHorizontal: 8,
    fontWeight: '500',
  } as ViewStyle,
});
