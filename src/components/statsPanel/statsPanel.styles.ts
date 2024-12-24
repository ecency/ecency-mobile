import { TextStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({

    statValue: {
        fontFamily: '$editorFont',
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 34,
        fontWeight: 'normal',
    } as TextStyle,

    statLabel: {
        color: '$primaryBlack',
        alignSelf: 'center',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'normal',
    } as TextStyle,
})