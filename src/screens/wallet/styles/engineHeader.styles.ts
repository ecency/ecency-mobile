import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container:{
    marginBottom:12, marginTop:8
  } as ViewStyle,
  engineBtnContainer: {
    alignItems: 'flex-end',
    // 
    marginVertical: 8,
  } as TextStyle,
  engineBtnText: {
    color: '$primaryBlue',
  } as TextStyle,
  headerWrapper: {
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  } as ViewStyle,
  title:{
    fontSize:18,
  color: '$primaryBlack'
  } as TextStyle,
  rightIconWrapper: {
    alignSelf: 'center',
    backgroundColor: '$primaryLightBackground',
    width: 40,
    height:40,
    borderRadius:20,
    alignItems:'center',
    justifyContent:'center',
  } as ViewStyle,
  rightIcon: {
    color: '$primaryBlack',
  } as ViewStyle,
})