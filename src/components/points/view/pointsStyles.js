import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  pointText: {
    color: '$primaryBlue',
    fontSize: 24,
    marginTop: 24,
    justifyContent: 'center',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  subText: {
    color: '$tagColor',
    fontSize: 8,
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 5,
  },
  iconsWrapper: {
    marginVertical: 32,
    justifyContent: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
  },
  iconWrapper: {
    marginHorizontal: 16,
    width: 36,
    height: 36,
    borderRadius: 36 / 2,
    backgroundColor: '$primaryGrayBackground',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIconWrapper: {
    backgroundColor: '$primaryBlue',
  },
  activeIcon: {
    color: '$white',
  },
  icon: {
    fontSize: 24,
    color: '$primaryDarkText',
  },
  badge: {
    position: 'absolute',
    right: -7,
    top: 20,
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
    padding: 2,
    height: 12,
    minWidth: 18,
    borderRadius: 12 / 2,

  },
  badgeText: {
    fontSize: 8,
    color: '$white',
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '$black',
  },
});
