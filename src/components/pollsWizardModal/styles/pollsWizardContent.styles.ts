import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container:{
        paddingHorizontal:16,
        paddingVertical:8,
        maxHeight:'$deviceWidth/1.2',
    } as ViewStyle,
    title:{
        fontSize:18,
        color:'$primaryDarkText',
    } as TextStyle,
    label:{
        fontSize:16,
        color:'$primaryDarkText',
        marginTop:16,
    } as TextStyle,
    addChoice:{
        paddingTop:12,
        color: "$primaryBlue",
        fontWeight: 'bold',
    },
    inputWrapper:{
        borderRadius:16,
        borderTopEndRadius:16,
        borderTopStartRadius:16,
        marginTop:12,
        borderBottomColor:'transparent',
        height:44
    } as ViewStyle,
    input:{
        color:'$primaryDarkText',
    } as TextStyle

});