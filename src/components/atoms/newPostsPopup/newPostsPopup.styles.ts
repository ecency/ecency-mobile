import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  
  popupContainer: {
    position: 'absolute',
    topicsResultsContainer: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  popupContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryBlue',
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderRadius:32,
  } as ViewStyle ,
  postedText: {
    fontWeight: '500',
    color: '$primaryGray',
    marginLeft: 6,
  },
  closeIcon: {
    color: '$primaryGray',
    margin: 0,
    padding: 6,
  },
  arrowUpIcon: {
    color: '$primaryGray',
    margin: 0,
    marginHorizontal: 4,
  },
  popupImage: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginLeft: -8,
    borderColor: '$primaryBlue',
  },
  moreIcon: {
    marginLeft: -4,
    borderWidth: EStyleSheet.hairlineWidth,
    borderColor: '$primaryGray',
    height: 20,
    width: 20,
  },

});
