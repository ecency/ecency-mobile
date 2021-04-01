import { TextStyle, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    modalStyle: {
        backgroundColor: '$primaryBackgroundColor',
        margin:0,
        paddingTop:32,
        paddingBottom:8,
      },

      sheetContent: {
        height:400,
        backgroundColor: '$modalBackground',
      },

    container:{
        flex:1,
        marginTop:24,
        paddingHorizontal:24,
    },

    contentContainer:{
        flex:1,
        alignItems:'center',
    } as ViewStyle,


    imageStyle:{
        height:150,
        width:150,
    } as ImageStyle,

    btnText:{
        color:'$pureWhite'
    } as TextStyle,

    button:{

        backgroundColor:'$primaryBlue',
        width:150,
        paddingVertical:16,
        borderRadius:32,
        justifyContent:'center',
        alignItems:'center'
    } as ViewStyle,


    actionPanel:{
        flexDirection:'row', 
        justifyContent:'space-around', 
        alignItems:'center', 
        marginBottom:64
    } as ViewStyle,

})