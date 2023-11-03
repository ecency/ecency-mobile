import { ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  bodyWrapper: {
    flex: 3,
    paddingHorizontal: 16,
  },
  floatingContainer: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    justifyContent: 'flex-end',
    zIndex: 10,
  } as ViewStyle,
  itemWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '$primaryBackgroundColor',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
  },
  itemWrapperGray: {
    backgroundColor: '$primaryLightBackground',
  },
  itemIcon: {
    color: '$primaryDarkGray',
  },
  itemIconWrapper: {
    marginLeft: 8,
  },
  title: {
    fontWeight: '700',
    flex: 1,
    fontSize: 16,
    color: '$primaryBlack',
  },
  body: {
    paddingBottom: 8,
    color: '$primaryBlack',
  },
});
