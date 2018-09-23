import { createStyle } from "react-native-theming";
import { Dimensions } from "react-native";

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

export default createStyle({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        color: "#357ce6",
        fontSize: 20,
        fontWeight: "bold",
        marginTop: 25,
        alignSelf: "center",
        marginBottom: 25,
    },
    logo: {
        marginTop: deviceHeight / 8,
    },
    forgotButtonText: {
        color: "#788187",
        fontSize: 14,
        marginTop: 25,
        alignSelf: "center",
        marginBottom: 25,
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderColor: "#fff",
        borderRadius: 5,
        paddingLeft: 15,
        minWidth: deviceWidth / 2,
    },
    icon: {
        color: "#357ce6",
    },
});
