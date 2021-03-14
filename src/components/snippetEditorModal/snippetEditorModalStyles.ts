import EStyleSheet from 'react-native-extended-stylesheet';

export default EStyleSheet.create({
    container:{
        flex:1
    },
    titleInput:{
        color: '$primaryBlack',
        fontWeight: 'bold',
        fontSize: 18,
        textAlignVertical: 'top',
        paddingVertical: 0,
        backgroundColor:'$primaryBackgroundColor',
    },
    bodyWrapper: {
        fontSize: 16,
        paddingTop: 16,
        paddingBottom: 0, // On android side, textinput has default padding
        color: '$primaryBlack',
        textAlignVertical: 'top',
        backgroundColor: '$primaryBackgroundColor',
      },
})