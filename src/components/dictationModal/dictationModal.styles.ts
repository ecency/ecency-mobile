import { ViewStyle, TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  } as ViewStyle,

  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
    alignItems: 'center',
  } as ViewStyle,

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    marginBottom: 8,
  } as TextStyle,

  clock: {
    fontSize: 40,
    fontWeight: '300',
    color: '$primaryBlack',
    // Tabular figures so the timer does not jitter as digits change width.
    fontVariant: ['tabular-nums'],
    marginVertical: 8,
  } as TextStyle,

  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '$primaryRed',
    marginRight: 6,
  } as ViewStyle,

  recordingLabel: {
    fontSize: 14,
    color: '$primaryRed',
  } as TextStyle,

  cost: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginBottom: 4,
  } as TextStyle,

  hint: {
    fontSize: 12,
    color: '$primaryDarkGray',
  } as TextStyle,

  error: {
    fontSize: 14,
    color: '$primaryRed',
    textAlign: 'center',
    marginBottom: 8,
  } as TextStyle,

  retryButton: {
    alignSelf: 'center',
    marginBottom: 8,
  } as ViewStyle,

  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  } as ViewStyle,

  button: {
    marginHorizontal: 6,
  } as ViewStyle,

  transcribingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  } as ViewStyle,
});
