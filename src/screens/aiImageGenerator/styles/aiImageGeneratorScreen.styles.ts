import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scrollContent: {
    padding: 16,
  },
  balanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '$primaryDarkGray',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryBlue',
  },
  promptLabel: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginBottom: 8,
  },
  promptInput: {
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 8,
    padding: 12,
    color: '$primaryBlack',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '$primaryBackgroundColor',
  },
  charCount: {
    fontSize: 12,
    color: '$primaryDarkGray',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  suggestionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  suggestionPillText: {
    fontSize: 12,
    color: '$primaryBlue',
  },
  sectionLabel: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginBottom: 10,
  },
  ratioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  ratioPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: '$primaryBackgroundColor',
  },
  ratioPillActive: {
    backgroundColor: '$primaryBlue',
    borderColor: '$primaryBlue',
  },
  ratioPillText: {
    fontSize: 13,
    color: '$primaryDarkGray',
  },
  ratioPillTextActive: {
    color: '$white',
    fontWeight: '600',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  costLabel: {
    fontSize: 14,
    color: '$primaryDarkGray',
  },
  costValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryBlue',
  },
  generateButton: {
    paddingHorizontal: 44,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  generateButtonText: {
    color: 'white',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '$primaryDarkGray',
    marginTop: 12,
  },
  resultContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '$primaryLightBackground',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
  },
  generateAgainButton: {
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
});
