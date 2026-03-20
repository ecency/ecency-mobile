import { ViewStyle, TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  } as ViewStyle,

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  } as ViewStyle,

  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
  } as TextStyle,

  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,

  balanceLabel: {
    fontSize: 12,
    color: '$iconColor',
  } as TextStyle,

  balanceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '$primaryBlue',
  } as TextStyle,

  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
    marginBottom: 8,
  } as TextStyle,

  actionCard: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,

  actionCardSelected: {
    borderColor: '$primaryBlue',
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
  } as TextStyle,

  actionNameSelected: {
    color: '$white',
  } as TextStyle,

  actionDesc: {
    fontSize: 11,
    color: '$iconColor',
    marginTop: 2,
  } as TextStyle,

  actionDescSelected: {
    color: '$white',
    opacity: 0.8,
  } as TextStyle,

  actionCost: {
    fontSize: 11,
    color: '$iconColor',
  } as TextStyle,

  actionCostSelected: {
    color: '$white',
    opacity: 0.8,
  } as TextStyle,

  freeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '$successColor',
    marginRight: 6,
  } as TextStyle,

  textInput: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '$primaryBlack',
    minHeight: 120,
    textAlignVertical: 'top',
    marginTop: 8,
  } as TextStyle,

  charCount: {
    fontSize: 11,
    color: '$iconColor',
    marginTop: 4,
    textAlign: 'right',
  } as TextStyle,

  charCountError: {
    color: '$primaryRed',
  } as TextStyle,

  errorText: {
    fontSize: 12,
    color: '$primaryRed',
    marginTop: 8,
  } as TextStyle,

  submitButton: {
    marginTop: 16,
    height: 44,
    borderRadius: 10,
  } as ViewStyle,

  // Result view styles
  resultLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '$primaryBlack',
    marginBottom: 12,
  } as TextStyle,

  resultBox: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 10,
    padding: 14,
    maxHeight: 300,
  } as ViewStyle,

  resultText: {
    fontSize: 14,
    color: '$primaryBlack',
    lineHeight: 20,
  } as TextStyle,

  titleOption: {
    borderWidth: 1,
    borderColor: '$primaryLightBackground',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
  } as ViewStyle,

  titleOptionSelected: {
    borderColor: '$primaryBlue',
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  titleOptionText: {
    fontSize: 14,
    color: '$primaryBlack',
  } as TextStyle,

  titleOptionTextSelected: {
    color: '$white',
  } as TextStyle,

  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  } as ViewStyle,

  tagChip: {
    backgroundColor: '$primaryBlue',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  } as ViewStyle,

  tagChipText: {
    color: '$white',
    fontSize: 12,
    fontWeight: '600',
  } as TextStyle,

  resultActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  } as ViewStyle,

  actionButton: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  actionButtonSecondary: {
    backgroundColor: '$primaryLightBackground',
  } as ViewStyle,

  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '$white',
  } as TextStyle,

  actionButtonTextSecondary: {
    color: '$primaryBlack',
  } as TextStyle,

  costRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  } as ViewStyle,

  costLabel: {
    fontSize: 12,
    color: '$iconColor',
  } as TextStyle,

  costValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '$primaryBlue',
  } as TextStyle,

  freeCostValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '$successColor',
  } as TextStyle,

  actionCardContent: {
    flex: 1,
  } as ViewStyle,

  sectionLabelWithMargin: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryBlack',
    marginBottom: 8,
    marginTop: 16,
  } as TextStyle,

  submitButtonDisabled: {
    opacity: 0.5,
  } as ViewStyle,

  submitButtonTextCentered: {
    fontSize: 13,
    fontWeight: '600',
    color: '$white',
    textAlign: 'center',
  } as TextStyle,

  sheetContainer: {
    maxHeight: '85%',
    backgroundColor: '$primaryBackgroundColor',
  } as ViewStyle,
});
