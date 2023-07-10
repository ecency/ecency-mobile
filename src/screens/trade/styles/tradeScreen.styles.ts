import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '$primaryBackgroundColor'
  },
  balance: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '$iconColor',
    alignSelf: 'flex-end'
  } as TextStyle,
  marketRate: {
    padding: 10,
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '$primaryDarkText'
  } as TextStyle,
  changeBtnContainer:{ 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    right: 0, 
    left: 0, 
    justifyContent: 'center', 
    alignItems: 'center' 
  } as ViewStyle,
  changeBtn: { 
    justifyContent:'center',
    alignItems:'center',
    backgroundColor: '$primaryLightBackground', 
    borderRadius: 28, 
    borderWidth: 8, 
    borderColor: '$primaryBackgroundColor',
  } as ViewStyle,
  changeBtnSize:{
      height: 60, 
      width: 60, 
  } as ViewStyle,
  mainBtnContainer:{
    alignItems:'center'
  } as ViewStyle,
  mainBtn: {
    width: '$deviceWidth / 3',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    marginVertical: 16,
  } as ViewStyle,
  buttonText:{
    color: 'white',
  }
})