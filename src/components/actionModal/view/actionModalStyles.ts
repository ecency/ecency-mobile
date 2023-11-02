import { TextStyle, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  modalStyle: {
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },

  container: {
    marginTop: 16,
    marginBottom: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  imageStyle: {
    marginTop: 8,
    height: 150,
    width: '100%',
  } as ImageStyle,

  textContainer: {
    marginTop: 32,
    marginBottom: 44,
  } as ViewStyle,

  title: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
  } as TextStyle,

  bodyText: {
    color: '$primaryBlack',
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  } as TextStyle,

  btnText: {
    color: '$pureWhite',
  } as TextStyle,

  button: {
    backgroundColor: '$primaryBlue',
    minWidth: 150,
    paddingVertical: 16,
    marginVertical: 8,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  actionPanel: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,
});
