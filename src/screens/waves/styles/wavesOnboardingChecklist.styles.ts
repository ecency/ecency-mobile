import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  card: {
    backgroundColor: '$primaryLightBackground',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  } as ViewStyle,
  dismissBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 4,
    zIndex: 1,
  } as ViewStyle,
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 28,
  } as ViewStyle,
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryDarkText',
    fontFamily: '$primaryFont',
  } as TextStyle,
  cardSubtitle: {
    fontSize: 13,
    color: '$primaryDarkGray',
    marginTop: 2,
    paddingRight: 28,
    fontFamily: '$primaryFont',
  } as TextStyle,
  progressText: {
    fontSize: 12,
    color: '$primaryDarkGray',
    fontFamily: '$primaryFont',
  } as TextStyle,
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '$borderColor',
    marginTop: 10,
    overflow: 'hidden',
  } as ViewStyle,
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '$primaryBlue',
  } as ViewStyle,
  itemsWrap: {
    marginTop: 6,
  } as ViewStyle,
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  } as ViewStyle,
  itemLabel: {
    fontSize: 14,
    color: '$primaryDarkText',
    marginLeft: 10,
    fontFamily: '$primaryFont',
  } as TextStyle,
  itemLabelDone: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  } as TextStyle,
  itemLabelAction: {
    color: '$primaryBlue',
    fontWeight: '600',
  } as TextStyle,
});
