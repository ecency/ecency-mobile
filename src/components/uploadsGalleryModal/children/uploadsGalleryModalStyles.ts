import { TextStyle, StyleSheet, ViewStyle,  ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const gridItemHeight = 96;
const gridItemWidth = gridItemHeight;

export default EStyleSheet.create({
    modalStyle: {
        height:112,
        borderBottomWidth:1,
        borderColor:'$primaryLightBackground'
      },
      container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 8,
      },
      floatingContainer:{
        flexDirection:'row',
        position:'absolute',
        bottom:0,
        right:0,
        left: 0,
        justifyContent:'flex-end',
        alignItems:'center',
        zIndex:10,
        paddingVertical:8,
        paddingHorizontal: 16,
        backgroundColor:'$primaryBackgroundColor'
      } as ViewStyle,

      mediaItem:{
        marginLeft:8, 
        height:gridItemHeight,
        width:gridItemWidth,
        borderRadius:16,
        backgroundColor:'$primaryLightGray'
      } as ImageStyle,
      
    inputContainer:{
        flex:1
    } as ViewStyle,
    titleInput:{
        color: '$primaryBlack',
        fontWeight: 'bold',
        fontSize: 18,
        textAlignVertical: 'top',
        paddingVertical: 0,
        backgroundColor:'$primaryBackgroundColor',
        borderBottomWidth:StyleSheet.hairlineWidth,
        borderBottomColor:'$primaryDarkGray'
    } as TextStyle,

    title: {
        fontWeight: '700',
        flex:1,
        fontSize:16,
        color:'$primaryBlack'
      } as TextStyle,

    btnText:{
        color:'$pureWhite'
    } as TextStyle,
    saveButton:{

        backgroundColor:'$primaryBlue',
        width:150,
        paddingVertical:16,
        borderRadius:32,
        justifyContent:'center',
        alignItems:'center'
    } as ViewStyle,
    closeButton:{
        marginRight:16,
        paddingVertical:8,
        borderRadius:16,
        justifyContent:'center',
        alignItems:'center'
    } as ViewStyle,
    actionPanel:{
        flexDirection:'row', 
        justifyContent:'flex-end', 
        alignItems:'center', 
        marginBottom:16
    } as ViewStyle,

    itemIcon:{
      color:'$white',
    } as ViewStyle,

    itemIconWrapper:{
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'$primaryRed',

    } as ViewStyle,

    checkContainer:{
      position:'absolute', 
      bottom:20, 
      right:20
    } as ViewStyle,

    checkStyle:{
      backgroundColor:'$white',
    } as ViewStyle,

    listEmptyFooter: {
      height: 80,
    } as ViewStyle,

})
