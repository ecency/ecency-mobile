import { TextStyle, ViewStyle } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({

    label:{
        fontSize:16,
        color:'$primaryDarkText',
        marginTop:16
    } as TextStyle,
    settingsTitle:{
        fontWeight:'400',
        fontSize:16,
    },
    settingsWrapper:{
        marginTop:20
    },
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
    } as TextStyle,
    optionsContainer:{
         position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: '$primaryBackgroundColor' 
    }

});