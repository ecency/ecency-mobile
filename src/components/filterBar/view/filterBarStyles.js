import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default EStyleSheet.create({
  container: {
    justifyContent: 'center',
    backgroundColor: '$primaryLightBackground',
    shadowOpacity: 0.3,
    shadowColor: '$shadowColor',
    elevation: 0.1,
    shadowOffset: {
      height: 1,
    },
    zIndex: 99,
  },
  dropdownWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    left: 5,
    flex: 6,
  },
  filterBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    flex: 1,
    marginRight: 5,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  },
});
