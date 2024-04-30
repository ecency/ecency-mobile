import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    progressBar: {
        borderRadius: 12,
        borderWidth: 0,
        alignSelf: 'stretch',
        marginHorizontal: 8,
    
    } as ViewStyle,
    optionsTextWrapper: {
        position: 'absolute',
        left: 24, right: 24,
        top: 0, bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    } as ViewStyle,
    label:{
        fontSize:12,
    } as TextStyle,
    count:{
        fontSize:12,
        marginHorizontal:8,
        alignSelf:'flex-end',
        color: '$primaryDarkGray'
    } as TextStyle
});