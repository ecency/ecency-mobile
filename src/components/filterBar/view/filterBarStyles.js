import EStyleSheet from 'react-native-extended-stylesheet';
import { relative } from 'path';

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
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightIconWrapper: {
    marginRight: 16,
    alignSelf: 'center',
  },
  rightIcon: {
    color: '$darkIconColor',
    textAlign: 'center',
  },
  buttonGroup: {
    position: 'absolute',
    borderWidth: 0,
    left: 0,
    backgroundColor: 'transparent',
    height: 30,
  },
  innerBorder: {
    width: 0,
  },
  buttons: {
    borderRadius: 50,
    width: 70,
    marginRight: 5
  },
  buttonText: {
    fontSize: 12
  }
});
