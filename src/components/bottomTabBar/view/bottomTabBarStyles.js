import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

const deviceWidth = Dimensions.get('window').width;

export default EStyleSheet.create({
  wrapper: {
    width: '$deviceWidth',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 99999,
  },
  subContent: {
    flexDirection: 'row',
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    marginHorizontal: 19,
    justifyContent: 'space-between',
  },
  navItem: {
    alignItems: 'center',
    zIndex: 0,
    padding: 20,
    width: (deviceWidth - 38) / 5,
  },
  circle: {
    bottom: 25,
  },
});
