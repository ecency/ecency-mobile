import { createStyle } from "react-native-theming";
import { Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default createStyle({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        width: deviceWidth / 3,
        height: deviceHeight / 6,
        backgroundColor: "transparent",
    },
});
