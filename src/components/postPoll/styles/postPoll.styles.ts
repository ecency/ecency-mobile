import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container: {
        marginTop:16,
        borderRadius: 12,
        borderWidth: EStyleSheet.hairlineWidth,
        borderColor: '$iconColor',
        padding:8
    } as ViewStyle,
    headerWrapper:{
        flexWrap:'wrap',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginHorizontal:8,
        marginBottom:12
    } as ViewStyle,
    question:{
        fontSize:16,
        fontWeight:'600',
        color: "$primaryBlack",
    } as TextStyle,
    countdonw:{
        fontSize:12,
        color: "$primaryBlack",
    } as TextStyle,
    optionsTextWrapper: {
        position: 'absolute',
        left: 24, right: 24,
        top: 0, bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    } as ViewStyle,
});