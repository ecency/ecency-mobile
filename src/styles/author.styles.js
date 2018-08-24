import { createStyle } from "react-native-theming";
import { StatusBar, Dimensions } from "react-native";

const styles = createStyle({
    container: {
        flex: 1,
        top: StatusBar.currentHeight,
    },
    content: {
        backgroundColor: "#f9f9f9",
    },
    cover: {
        width: Dimensions.get("window").width,
        height: 160,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        top: -50,
        borderWidth: 1,
        borderColor: "white",
        alignSelf: "center",
    },
    about: {
        borderColor: "lightgray",
        borderTopWidth: 1,
        borderBottomWidth: 1,
        flexDirection: "row",
    },
    info: {
        flexDirection: "row",
        borderBottomWidth: 0,
    },
    tabs: {
        alignSelf: "center",
        backgroundColor: "transparent",
    },
    tabbar: {
        alignSelf: "center",
        height: 40,
        backgroundColor: "#fff",
    },
    tabbarItem: {
        flex: 1,
        paddingHorizontal: 7,
        backgroundColor: "#f9f9f9",
        minWidth: Dimensions.get("window").width / 1,
    },
});

export default styles;
