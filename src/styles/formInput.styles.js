import { createStyle } from "react-native-theming";
import { Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;

export default createStyle({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        backgroundColor: "#f5f5f5",
        borderRadius: 5,
        padding: 15,
        minWidth: deviceWidth / 2,
    },
});
