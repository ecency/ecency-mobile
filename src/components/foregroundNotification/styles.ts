import { Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';

export const CONTAINER_HEIGHT = getStatusBarHeight() + 100;

export default EStyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    justifyContent: 'center',
    zIndex: 9999,
    marginHorizontal: 8,
    paddingTop: 16,
    marginTop: Platform.select({
      ios: getStatusBarHeight() + 12,
      android: 8,
    }),
    backgroundColor: '$darkGrayBackground',
    shadowColor: '#5f5f5fbf',
    shadowOpacity: 0.3,
    shadowOffset: {
      height: 5,
    },
    elevation: 3,
    borderRadius: 12,
    width: '$deviceWidth - 16',
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    paddingLeft: 16,
  },
});
