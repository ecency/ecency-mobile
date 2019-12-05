import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default EStyleSheet.create({
  wrapper: {
    width: '$deviceWidth',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 999,
  },
  subContent: {
    flexDirection: 'row',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    marginHorizontal: 20,
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    zIndex: 0,
    paddingBottom: 20,
    width: (deviceWidth - 38) / 5,
  },
  navItem2: {
    paddingRight: 5,
    paddingLeft: 2,
  },
  navItem3: {
    paddingRight: 0,
    paddingLeft: 2,
  },
  circle: {
    bottom: 25,
  },
});
