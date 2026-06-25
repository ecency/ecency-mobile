import EStyleSheet from 'react-native-extended-stylesheet';
import { TextStyle, ViewStyle } from 'react-native';

export default EStyleSheet.create({
  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  } as ViewStyle,

  title: {
    color: '$primaryBlack',
    fontSize: 18,
    fontWeight: '800',
  } as TextStyle,

  subtitle: {
    color: '$primaryDarkGray',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  } as TextStyle,

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '$borderColor',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 4,
    height: 48,
  } as ViewStyle,

  hash: {
    color: '$primaryDarkGray',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 4,
  } as TextStyle,

  input: {
    flex: 1,
    color: '$primaryBlack',
    fontSize: 15,
    paddingVertical: 0,
  } as TextStyle,

  addBtn: {
    backgroundColor: '$primaryBlue',
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,

  addBtnDisabled: {
    opacity: 0.4,
  } as ViewStyle,

  addBtnIcon: {
    color: '$pureWhite',
  } as TextStyle,

  scroll: {
    marginTop: 16,
    maxHeight: 360,
  } as ViewStyle,

  scrollContent: {
    paddingBottom: 8,
  } as ViewStyle,

  sectionTitle: {
    color: '$primaryDarkGray',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 8,
  } as TextStyle,

  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  } as ViewStyle,

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '$primaryLightBackground',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  } as ViewStyle,

  chipText: {
    color: '$primaryBlue',
    fontSize: 13,
    fontWeight: '600',
  } as TextStyle,

  chipAddIcon: {
    color: '$primaryBlue',
    marginLeft: 4,
  } as TextStyle,

  chipActive: {
    backgroundColor: '$primaryBlue',
  } as ViewStyle,

  chipActiveText: {
    color: '$pureWhite',
    fontSize: 13,
    fontWeight: '600',
  } as TextStyle,

  chipActiveIcon: {
    color: '$pureWhite',
    marginLeft: 4,
  } as TextStyle,
});
