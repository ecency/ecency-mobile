import { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import getWindowDimensions from '../../utils/getWindowDimensions';

export default EStyleSheet.create({
  modalStyle: {
    backgroundColor: '$primaryBackgroundColor',
    margin: 0,
    paddingTop: 32,
    paddingBottom: 8,
  },

  sheetContent: {
    backgroundColor: '$primaryBackgroundColor',
  },

  container: {
    marginTop: 16,
    marginBottom: 44,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  } as ViewStyle,

  imageStyle: {
    marginTop: 8,
    height: 150,
    width: 150,
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
    width: 150,
    paddingVertical: 16,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  actionPanel: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  } as ViewStyle,

  checkView: {
    width: getWindowDimensions().width - 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 4,
  } as ViewStyle,

  informationText: {
    color: '$primaryBlack',
    margin: 10,
    fontSize: 18,
  } as TextStyle,
});
