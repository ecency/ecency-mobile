import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },

  // Header / URL bar
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: '$primaryBackgroundColor',
    borderBottomWidth: EStyleSheet.hairlineWidth,
    borderBottomColor: '$primaryLightBackground',
  },
  navButton: {
    padding: 8,
  },
  urlBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 10,
    marginHorizontal: 4,
    paddingHorizontal: 10,
    height: 38,
  },
  lockIcon: {
    marginRight: 6,
  },
  urlInput: {
    flex: 1,
    fontSize: 14,
    color: '$primaryBlack',
    padding: 0,
    ...(Platform.OS === 'android' && { paddingVertical: 0 }),
  },
  clearButton: {
    padding: 4,
  },

  // Progress bar
  progressBar: {
    height: 2,
    backgroundColor: '$primaryBlue',
  },
  progressBarTrack: {
    height: 2,
    backgroundColor: 'transparent',
  },

  // WebView
  webView: {
    flex: 1,
  },

  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '$iconColor',
    textAlign: 'center',
    marginTop: 12,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '$primaryBlue',
    borderRadius: 20,
  },
  retryText: {
    color: '$pureWhite',
    fontWeight: '600',
    fontSize: 14,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBackgroundColor',
    borderTopWidth: EStyleSheet.hairlineWidth,
    borderTopColor: '$primaryLightBackground',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 8,
    marginHorizontal: 2,
    paddingHorizontal: 8,
    paddingVertical: 6,
    maxWidth: 160,
  },
  tabItemActive: {
    borderWidth: 1.5,
    borderColor: '$primaryBlue',
  },
  tabTitle: {
    flex: 1,
    fontSize: 11,
    color: '$primaryBlack',
    marginRight: 4,
  },
  tabClose: {
    padding: 2,
  },
  tabAddButton: {
    padding: 8,
  },

  // Home / Dashboard
  homeContainer: {
    flex: 1,
  },
  homeContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  homeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '$primaryBlack',
    marginBottom: 4,
  },
  homeSubtitle: {
    fontSize: 14,
    color: '$iconColor',
    marginBottom: 24,
  },
  homeSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '$iconColor',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  dappGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  dappItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  dappIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  dappIconText: {
    fontSize: 22,
    fontWeight: '700',
    color: '$pureWhite',
  },
  dappName: {
    fontSize: 11,
    color: '$primaryBlack',
    textAlign: 'center',
    fontWeight: '500',
  },
  dappCategory: {
    fontSize: 9,
    color: '$iconColor',
    textAlign: 'center',
    marginTop: 1,
  },

  // Home search bar
  homeSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    marginBottom: 24,
  },
  homeSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '$primaryBlack',
    marginLeft: 8,
    padding: 0,
    ...(Platform.OS === 'android' && { paddingVertical: 0 }),
  },
});
