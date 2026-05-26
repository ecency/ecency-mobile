import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor',
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '$primaryDarkGray',
    marginTop: 2,
    fontFamily: '$primaryFont',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '$primaryDarkGray',
    marginTop: 14,
    marginBottom: 4,
    fontFamily: '$primaryFont',
  },
  tabRow: {
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '$primaryBlue',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '$primaryDarkGray',
    fontFamily: '$primaryFont',
  },
  tabTextActive: {
    color: '$primaryBlue',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '$primaryLightBlue',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  streakText: {
    color: '$white',
    fontWeight: 'bold',
    marginLeft: 6,
    fontFamily: '$primaryFont',
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '$primaryGrayBackground',
    marginRight: 12,
  },
  questBody: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
  },
  questCount: {
    fontSize: 12,
    color: '$primaryDarkGray',
    fontFamily: '$primaryFont',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '$borderColor',
    marginTop: 6,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '$primaryBlue',
  },
  fillDone: {
    backgroundColor: '$primaryGreen',
  },
  spendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '$borderColor',
  },
  spendBody: {
    flex: 1,
    marginLeft: 12,
  },
  spendTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
  },
  spendDesc: {
    fontSize: 12,
    color: '$primaryDarkGray',
    fontFamily: '$primaryFont',
  },
});
