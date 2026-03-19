import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '$primaryBackgroundColor',
  },

  // --- Recipient Section ---
  recipientSection: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '$primaryLightBackground',
    marginBottom: 16,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowIcon: {
    fontSize: 24,
    color: '$iconColor',
    marginHorizontal: 16,
  },

  // --- Fields ---
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '$iconColor',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputField: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '$primaryBlack',
    fontSize: 16,
    backgroundColor: '$primaryLightBackground',
    minHeight: 48,
  },
  inputText: {
    fontSize: 16,
    color: '$primaryBlack',
    paddingHorizontal: 14,
  },

  // --- Amount ---
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInputLarge: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  fundBadge: {
    backgroundColor: '$primaryBlue',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  fundBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  maxButton: {
    color: '$primaryBlue',
    fontSize: 13,
    fontWeight: '700',
  },
  balanceText: {
    fontSize: 12,
    color: '$iconColor',
    marginTop: 6,
  },

  // --- Memo ---
  memoInput: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  memoHint: {
    fontSize: 11,
    color: '$iconColor',
    marginTop: 4,
  },

  // --- Dropdowns ---
  dropdownWrapper: {
    flexGrow: 1,
  },
  dropdownMenu: {
    marginTop: 15,
    minWidth: 200,
    width: '100%',
    maxHeight: 300,
    borderRadius: 12,
  },
  dropdownRowText: {
    fontSize: 14,
    color: '$primaryDarkGray',
    padding: 8,
  },

  // --- Input Error ---
  inputError: {
    borderColor: '$primaryRed',
  },

  // --- Suggestions Dropdown ---
  suggestionsContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 999,
    elevation: 5,
  },
  suggestionsList: {
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
    shadowOpacity: 0.2,
    shadowColor: '$shadowColor',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    maxHeight: 200,
  },

  // --- Delegation Info ---
  delegationInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  delegationInfoLabel: {
    fontSize: 13,
    color: '$iconColor',
    flex: 1,
  },
  delegationInfoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '$primaryBlack',
  },

  // --- Warnings ---
  badActorWarning: {
    color: '#e6a819',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },

  // --- Recurrent Transfer ---
  deleteRecurrentText: {
    color: '$primaryRed',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
  },

  // --- Convert ---
  convertDesc: {
    fontSize: 13,
    color: '$iconColor',
    lineHeight: 18,
  },

  // --- Submit ---
  submitContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  submitButton: {
    paddingHorizontal: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: '700',
  },

  // =========================================================
  // Legacy styles (used by delegateScreen, powerDownScreen)
  // =========================================================
  keyboardAwareScrollContainer: {
    backgroundColor: '$primaryBackgroundColor',
    padding: 16,
    paddingBottom: 96,
  },
  stepOneContainer: {
    zIndex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  stepTwoContainer: {
    paddingVertical: 16,
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  stepThreeContainer: {
    alignItems: 'center',
    marginTop: 16,
    marginVertical: 16,
  },
  toFromAvatarsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '$primaryBlack',
    flex: 1,
    minHeight: 35,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    paddingLeft: 10,
    color: '$primaryBlack',
    flex: 2,
    minHeight: 35,
  },
  error: {
    borderWidth: 1,
    borderColor: 'red',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 10,
    color: '$primaryBlack',
    flex: 1,
    height: 75,
  },
  description: {
    color: '$iconColor',
  },
  button: {
    paddingHorizontal: 44,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginVertical: 16,
  },
  stopButton: {
    paddingHorizontal: 44,
    marginTop: 30,
    marginBottom: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryRed',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
  },
  icon: {
    fontSize: 40,
    color: '$iconColor',
    marginHorizontal: 20,
  },
  rowTextStyle: {
    fontSize: 12,
    color: '$primaryDarkGray',
    padding: 5,
  },
  dropdownText: {
    fontSize: 14,
    paddingLeft: 12,
    paddingHorizontal: 14,
    color: '$primaryDarkGray',
  },
  dropdownStyle: {
    marginTop: 15,
    minWidth: 192,
    width: 192,
    maxHeight: '$deviceHeight - 200',
  },
  dropdownButtonStyle: {
    borderColor: '$borderColor',
    borderWidth: 1,
    height: 44,
    width: '100%',
    borderRadius: 8,
  },
  dropdown: {
    flexGrow: 1,
    width: 150,
  },
  middleContent: {
    flex: 1,
  },
  bottomContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  elevate: {
    zIndex: 1,
  },
  sectionHeading: {
    paddingHorizontal: 16,
    marginBottom: 0,
    fontSize: 18,
    fontWeight: '700',
    color: '$primaryBlack',
    textAlign: 'left',
  },
  sectionSubheading: {
    paddingHorizontal: 16,
    marginTop: 8,
    fontSize: 14,
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  alreadyDelegateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  sliderBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
  },
  emptyBox: {
    flex: 1,
  },
  sliderContainer: {
    flex: 2,
  },
  track: {
    height: 2,
    borderRadius: 1,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 20 / 2,
    backgroundColor: '$primaryLightBackground',
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
    shadowOpacity: 0.35,
    elevation: 3,
  },
  slider: {
    marginRight: 12,
    marginLeft: 8,
  },
  sliderAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  amountText: {
    fontSize: 12,
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  grow: {
    flexGrow: 1,
  },
  transferToContainer: {
    flex: 1,
    width: 172,
    position: 'relative',
  },
  usersDropdownContainer: {
    position: 'absolute',
    top: 40,
    width: 172,
    maxHeight: 250,
    zIndex: 999999,
    elevation: 3,
  },
  usersDropdown: {
    borderColor: '$primaryWhiteLightBackground',
    borderRadius: 5,
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    backgroundColor: '$primaryLightBackground',
    elevation: 3,
  },
  usersDropItemRow: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 3,
  },
  usersDropItemRowText: {
    color: '$primaryDarkGray',
    textAlign: 'left',
    marginLeft: 5,
  },
  paddBottom: {
    paddingBottom: 12,
  },
  fillSpace: {
    flex: 1,
    padding: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  beneficiaryContainer: {
    paddingHorizontal: 12,
    zIndex: 2,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  estimatedContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  leftEstimated: {
    flex: 1,
  },
  rightEstimated: {
    flex: 2,
    fontSize: 12,
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'right',
    paddingRight: 16,
  },
  powerDownKeyboadrAvoidingContainer: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  powerDownInfoContainer: {
    marginTop: 16,
    paddingHorizontal: 12,
    zIndex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  userAvatar: {},
  scroll: {},
  scrollContentContainer: {},
  fullHeight: {
    height: '100%',
  },
  addressContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '$primaryLightBackground',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressDescription: {
    color: '$iconColor',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '$primaryBlack',
    textAlign: 'center',
    marginBottom: 16,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  addressActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '$primaryBlue',
  },
  addressActionText: {
    color: '$white',
    fontWeight: '600',
  },
});
