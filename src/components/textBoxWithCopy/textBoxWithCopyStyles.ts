import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    marginVertical: 8,
    flex: 1,
  } as ViewStyle,
  copyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  inputLabel: {
    color: '$primaryBlack',
    fontWeight: '600',
    textAlign: 'left',
  },
  textValueContainer: {
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '$borderColor',
    paddingHorizontal: 10,
    marginVertical: 8,
    height: 40,
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    justifyContent: 'center',
  } as ViewStyle,
  textValue: {} as TextStyle,

  copyIconStyle: {
    borderRadius: 0,
    height: 40,
    width: 40,
    backgroundColor: '$primaryBlue',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  } as ViewStyle,
});
