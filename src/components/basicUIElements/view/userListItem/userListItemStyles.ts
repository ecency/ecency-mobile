import EStyleSheet from 'react-native-extended-stylesheet';
import { isRTL } from '../../../../utils/I18nUtils';

export default EStyleSheet.create({
  container: {
    padding: 8,
    flexDirection: 'row',
    height: '$deviceHeight - 110',
  },
  userDescription: {
    flexDirection: 'column',
    alignItems: isRTL() ? 'flex-end' : 'flex-start',
    flex: 1,
    marginLeft: isRTL() ? 0 : 8,
    marginRight: isRTL() ? 8 : 0,
  },
  voteItemWrapper: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    backgroundColor: '$primaryBackgroundColor',
  },
  voteItemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  name: {
    color: '$primaryDarkGray',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: '$primaryFont',
  },
  // Keeps the Pro checkmark on the same baseline as the name. RTL-aware like
  // userDescription so the badge stays on the trailing side of the handle.
  nameRow: {
    flexDirection: isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  reputation: {
    fontWeight: 'normal',
    fontFamily: '$primaryFont',
  },
  value: {
    color: '$primaryBlue',
    fontSize: 14,
    fontFamily: '$primaryFont',
    fontWeight: 'bold',
  },
  valueGray: {
    color: '$iconColor',
  },
  valueBlack: {
    color: '$primaryBlack',
  },
  rightWrapper: {
    textAlign: 'center',
    alignItems: 'flex-end',
    minWidth: 80,
    height: 30,
    justifyContent: 'center',
  },
  text: {
    color: '$iconColor',
    fontSize: 12,
    fontFamily: '$primaryFont',
  },
  avatar: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 32 / 2,
  },
  date: {
    color: '$primaryDarkGray',
  },
  itemIndex: {
    color: '$primaryDarkGray',
    fontSize: 10,
    marginRight: 17,
  },
  middleWrapper: {
    marginRight: 30,
  },
  summary: {
    color: '$primaryDarkGray',
  },
  popoverDetails: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    backgroundColor: '$primaryBackgroundColor',
  },
  arrow: {
    borderTopColor: '$primaryBackgroundColor',
    marginLeft: 0,
  },
  popoverWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipText: {
    color: '$primaryDarkText',
    alignSelf: 'center',
    maxWidth: 150,
  },
});
