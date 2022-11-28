import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    engineBtnContainer: {
    alignItems: 'flex-end',
    marginHorizontal: 32,
    marginVertical: 8,
  } as TextStyle,
  engineBtnText: {
    color: '$primaryBlue',
  } as TextStyle,
  engineHeaderContainer:{
    flexDirection:'row-reverse',
    justifyContent:'space-between',
    alignItems:'center'
  } as ViewStyle
})