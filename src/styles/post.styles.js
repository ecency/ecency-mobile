import { Dimensions } from "react-native";
import { createStyle } from "react-native-theming";

const styles = createStyle({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    comments: {
        flex: 1,
        backgroundColor: "white",
    },
});

export default styles;
