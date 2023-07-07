import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container: {
        marginHorizontal: 12,
        marginVertical:6,
        paddingHorizontal: 16,
        paddingBottom:32,
        paddingTop:12,
        borderWidth: 1,
        borderRadius: 16,
        borderColor: '$primaryLightBackground',
        backgroundColor: '$primaryLightBackground'
    } as ViewStyle,
    label: {
        fontSize: 18,
        color: '$primaryDarkText',
        paddingVertical: 6,
    } as TextStyle,
    inputContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    } as ViewStyle,
    input: {
        borderWidth: 0,
        color: '$primaryDarkText',
        fontSize: 28,
        fontWeight: 'bold',
        paddingVertical: 6,
        marginTop: 10,
    } as TextStyle,
    symbolContainer:{
        padding:6,
        paddingHorizontal:12,
        backgroundColor:'$primaryDarkGray',
        borderRadius:24,
    } as ViewStyle,
    symbol:{
        fontSize:16,
        fontWeight:'bold',
        color: '$white',
    } as TextStyle,
    fiat: {
        fontSize: 14,
        paddingVertical: 6,
        color: '$iconColor'
    },

})