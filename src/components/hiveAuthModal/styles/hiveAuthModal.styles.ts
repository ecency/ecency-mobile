import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
    sheetContent: {
        backgroundColor: '$modalBackground',
    },
    indicator: {
        backgroundColor: '$iconColor',
    },
    container: {
        height:'50%'
    },
    content: {
        paddingHorizontal: 16
    },
    input: {
        color: '$primaryDarkText',
        flexGrow: 1,
    },
})