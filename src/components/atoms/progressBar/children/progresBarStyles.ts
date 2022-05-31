import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container:{
        backgroundColor:'$primaryLightGray',
        flexDirection:'row',
        borderRadius:16,
        maxHeight:16,
        flexGrow:1,
        marginVertical:8,
    },
    filled:{
        borderRadius:16,
        backgroundColor:'$primaryBlue'
    },
});
