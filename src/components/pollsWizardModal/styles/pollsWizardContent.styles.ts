import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container:{
        paddingHorizontal:16,
        paddingVertical:8,
    } as ViewStyle,
    label:{
        fontSize:16,
        color:'$primaryDarkText',
        marginTop:16
    } as TextStyle,
    addChoice:{
        paddingTop:12,
        color: "$primaryBlue",
        fontWeight: 'bold',
    } as TextStyle,
    settingsTitle:{
        fontWeight:'400',
        fontSize:16,
    },
    settingsWrapper:{
        marginTop:20
    },
    inputContainer:{
        flexDirection:'row',
        alignItems:'center',
    },
    inputWrapper:{
        flex:1,
        borderRadius:16,
        borderTopEndRadius:16,
        borderTopStartRadius:16,
        marginTop:12,
        borderBottomColor:'transparent',
        height:44
    } as ViewStyle,
    input:{
        color:'$primaryDarkText',
    } as TextStyle,
    btnRemove:{
        marginTop:8,
        marginLeft:4
    },
    optionsContainer:{
        padding:16
    },
    actionPanel:{
        marginTop:16,
        flexDirection: 'row-reverse',
        alignItems: 'center'
    } as ViewStyle,
    btnReset:{
        paddingRight:12,
    } as TextStyle,
    btnMain:{
        paddingHorizontal:16
    } as ViewStyle,
    sheetContent: {
        backgroundColor: '$primaryBackgroundColor',
        zIndex: 999,
      },
    
      sheetIndicator: {
        backgroundColor: '$iconColor',
      },

});