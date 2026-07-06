import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,

  indicator: {
    backgroundColor: '$iconColor',
  } as ViewStyle,

  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  } as ViewStyle,

  hintText: {
    fontSize: 12,
    color: '$iconColor',
    marginBottom: 12,
    lineHeight: 18,
  } as TextStyle,

  labelsRow: {
    flexDirection: 'row',
    marginBottom: 6,
  } as ViewStyle,

  dropdownLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '$primaryDarkGray',
    textAlign: 'center',
  } as TextStyle,

  languageSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 60,
    backgroundColor: '$primaryLightBackground',
    borderRadius: 16,
  } as ViewStyle,

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  } as ViewStyle,

  convertIcon: {
    color: '$iconColor',
  } as TextStyle,

  dropdownRowTextStyle: {
    color: '$primaryBlack',
    fontSize: 14,
  } as TextStyle,

  detectedText: {
    fontSize: 12,
    color: '$iconColor',
    marginTop: 8,
  } as TextStyle,

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  } as ViewStyle,

  checkboxLabel: {
    fontSize: 14,
    color: '$primaryBlack',
    marginLeft: 8,
    flex: 1,
  } as TextStyle,

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  } as ViewStyle,

  progressText: {
    fontSize: 13,
    color: '$primaryBlack',
  } as TextStyle,

  errorText: {
    fontSize: 12,
    color: '$primaryRed',
    marginTop: 12,
  } as TextStyle,

  previewBox: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 10,
    padding: 14,
    maxHeight: 300,
    marginTop: 16,
  } as ViewStyle,

  previewText: {
    fontSize: 14,
    color: '$primaryBlack',
    lineHeight: 20,
  } as TextStyle,

  previewTextRtl: {
    writingDirection: 'rtl',
    textAlign: 'right',
  } as TextStyle,

  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  } as ViewStyle,

  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  actionButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,

  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '$white',
  } as TextStyle,
});
