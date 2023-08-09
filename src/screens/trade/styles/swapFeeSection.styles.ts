import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container: {
        margin: 12,
        padding: 6,
        borderRadius: 16,
        flexDirection:'row',
        justifyContent: 'space-between',
        alignItems:'center',
        backgroundColor: '$primaryLightBackground'
    } as ViewStyle,
    label: {
        fontSize: 18,
        color: '$primaryDarkText',
        padding: 10,
    } as TextStyle,
    freeContainer:{
        paddingVertical:4,
        paddingHorizontal:8,
        borderRadius:6,
        marginHorizontal:8,
        backgroundColor:'$primaryGreen'
    } as ViewStyle,
    free: {
        borderWidth: 0,
        color: '$primaryDarkText',
        fontSize: 16,
        fontWeight: 'bold',
    } as TextStyle,
    fiat: {
        fontSize: 14,
        padding: 10,
        color: '$iconColor'
    }
})