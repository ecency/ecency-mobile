import { ImageStyle } from 'react-native';
import { ViewStyle, TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
  baseStyle: {
    color: '$primaryBlack',
    fontFamily: '$primaryFont',
    maxWidth: '100%',
  } as TextStyle,
  body: {
    color: '$primaryBlack',
  } as TextStyle,
  a:{
    color: '$primaryBlue'
  } as TextStyle,
  img:{
    alignSelf:'center',
  } as ImageStyle,
  th:{
    flex: 1,
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '$primaryBlack',
    fontSize: 14,
    padding: 5,
  } as TextStyle,
  tr:{
    backgroundColor:'$darkIconColor',
    flexDirection:'row',
  } as ViewStyle,
  td:{
    flex:1,
    borderWidth: 0.5,
    padding:10,
    borderColor: '$tableBorderColor',
    backgroundColor: '$tableTrColor'
  } as ViewStyle,
  blockquote: {
    borderLeftWidth: 5,
    borderStyle:'solid',
    marginLeft:5,
    paddingLeft:5,
    borderColor: '$darkIconColor',
  } as ViewStyle,
  code:{
    backgroundColor:'$darkIconColor',
    fontFamily:'$editorFont'
  } as TextStyle,
  center: {
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  } as ViewStyle,
  revealButton: {
    backgroundColor: '$iconColor',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    minWidth: 40,
    maxWidth: 170,
  },
  revealText: {
    color: '$white',
    fontSize: 14,
  },
});
