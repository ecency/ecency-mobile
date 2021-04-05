import { TextStyle, StyleSheet, ViewStyle, Dimensions, ImageStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

const gridItemWidth = ((Dimensions.get('window').width/2) - 32);
const gridItemHeight = (gridItemWidth * 500)/600

export default EStyleSheet.create({
    modalStyle: {
        flex: 1,
        backgroundColor: '$primaryBackgroundColor',
        margin: 0,
        paddingTop: 32,
        paddingBottom: 16,
      },
      container: {
        flex: 1,
        justifyContent: 'space-between',
        paddingVertical: 8,
      },
      bodyWrapper: {
        flex: 3,
        paddingHorizontal:16
      },
      floatingContainer:{
        position:'absolute',
        bottom:0,
        right:20,
        justifyContent:'flex-end',
        zIndex:10
      } as ViewStyle,

      mediaItem:{
        margin:8, 
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

    removeItemContainer:{
      position:'absolute', 
      top:16, 
      right:16
    } as ViewStyle
})