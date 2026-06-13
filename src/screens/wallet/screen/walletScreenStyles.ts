import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  scrollContainer: {
    padding: 0,
  },
  header: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  headerActionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  headerActionButton: {
    marginHorizontal: 4,
    marginVertical: 8,
    paddingHorizontal: 24,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
  },
  headerActionButtonText: {
    fontSize: 13,
    color: '$primaryBlack',
    fontWeight: '600',
  },
  lastUpdateText: {
    color: '$iconColor',
    fontSize: 10,
  },
  dotStyle: {
    backgroundColor: '$primaryDarkText',
  },
  listWrapper: {
    backgroundColor: '$primaryBackgroundColor',
    flex: 1,
    paddingTop: 8,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '$primaryLightBackground',
  },
  errorText: {
    color: '$primaryDarkText',
    fontSize: 13,
    flex: 1,
    marginRight: 12,
  },
});
