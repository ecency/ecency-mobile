import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({

    headerWrapper: {
        flexWrap: 'wrap',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 8,
        marginBottom: 12
    } as ViewStyle,
    question: {
        fontSize: 16,
        fontWeight: '600',
        color: "$primaryBlack",
    } as TextStyle,
    timeContainer:{
        flexDirection:'row',
        alignItems:'center'
    } as ViewStyle,
    clockIcon:{
        marginLeft:4
    },
    timeText:{
        color:'$primaryDarkText',
    } as TextStyle,
    subText:{
        color:'$primaryDarkText',
        marginBottom:8,
    } as TextStyle

});