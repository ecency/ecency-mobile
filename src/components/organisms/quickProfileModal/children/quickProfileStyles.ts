import { TextStyle, ViewStyle, ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { getBottomSpace } from 'react-native-iphone-x-helper';

export default EStyleSheet.create({
    modalStyle: {
        backgroundColor: '$primaryBackgroundColor',
        margin:0,
        paddingTop:32,
        marginHorizontal:24,
        paddingBottom: getBottomSpace() + 8,
      },

    sheetContent: {
        backgroundColor: '$primaryBackgroundColor',
    },

    container:{
        alignItems:'center',
        marginHorizontal:16
    } as ViewStyle,

    image:{
        width:128,
        height:128,
        borderRadius:64,
        backgroundColor: '$primaryGray'
    } as ImageStyle,

    textContainer:{
        marginTop:32,
        marginBottom:44,
    } as ViewStyle,

    title: {
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        marginTop:32,
    } as TextStyle,

    statValue: {
        fontFamily:'$editorFont',
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'normal',
    } as TextStyle,

    statLabel: {
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'normal',
    } as TextStyle,


    bodyText: {
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 18,
        marginTop:6,
    } as TextStyle,


    btnText:{
        color:'$pureWhite'
    } as TextStyle,

    button:{
        marginTop: 40,
        backgroundColor:'$primaryBlue',
        paddingHorizontal:44,
        paddingVertical:16,
        borderRadius:32,
        justifyContent:'center',
        alignItems:'center'
    } as ViewStyle,


    actionPanel:{
        position: 'absolute',
        right:0,
        top:0,
        flexDirection:'row', 
        alignItems:'center', 
    } as ViewStyle,

    progressCircle:{
        position:'absolute', 
        top:0, 
        bottom:0, 
        left:0, 
        right:0, 
        alignItems:'center', 
        justifyContent:'center'
    } as ViewStyle

})