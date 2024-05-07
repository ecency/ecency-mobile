import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    choiceWrapper:{
        marginBottom:8
    },
    progressBar: {
        borderRadius: 12,
        borderWidth: 1,
        alignSelf: 'stretch',
        marginHorizontal: 8,
      
    
    } as ViewStyle,
    progressContentWrapper: {
        position: 'absolute',
        left: 24, right: 24,
        top: 0, bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between'
    } as ViewStyle,
    choiceLabelWrapper:{
        flexDirection: 'row',
        alignItems: 'center',
    },
    label:{
        marginLeft: 6,
        fontSize:12,
    } as TextStyle,
    count:{
        fontSize:12,
        marginLeft:8,
        color: '$primaryDarkGray'
    } as TextStyle
});