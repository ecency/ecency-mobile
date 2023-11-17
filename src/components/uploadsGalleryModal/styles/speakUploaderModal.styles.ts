import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
    modalStyle: {
        backgroundColor: '$primaryBackgroundColor',
        margin: 0,
        paddingTop: 32,
        paddingBottom: 8,
      },
    
      sheetContent: {
        backgroundColor: '$primaryBackgroundColor',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 999,
      },
      contentContainer: {
        padding: 16,
        paddingBottom:40
      },
      imageContainer: {
        marginBottom: 20,
      },
      thumbnail: {
        marginTop: 10,
        width: 177,
        height: 100,
        resizeMode: 'cover',
        borderRadius: 8,
        backgroundColor:"$primaryLightBackground"
      },
      label:{
        color: '$primaryDarkGray',
        fontSize: 14,
        fontWeight: 'bold',
        flexGrow: 1,
        textAlign: 'left',
      },
      titleBox: {
        marginBottom: 20,
      },
      titleInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 8,
        width: '80%',
        marginTop: 10,
        color: '$primaryDarkGray',
      },
      uploadButton: {
        marginBottom: 24, paddingHorizontal:16, alignSelf: 'center', alignItems:'center' 
      },
      buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
      },
})
