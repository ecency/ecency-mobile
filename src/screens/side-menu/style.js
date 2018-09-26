import { Platform } from "react-native";
import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
    drawerCover: {
        alignSelf: "stretch",
        backgroundColor: "#296CC0",
        height: "$deviceHeight / 5",
        width: null,
        position: "relative",
        marginBottom: 10,
    },
    drawerImage: {
        position: "absolute",
        left:
            Platform.OS === "android"
                ? "$deviceWidth / 20"
                : "$deviceWidth / 30",
        top:
            Platform.OS === "android"
                ? "$deviceHeight / 20"
                : "$deviceHeight / 20",
        width: 70,
        height: 70,
        resizeMode: "cover",
        borderWidth: 1,
        borderColor: "white",
        borderRadius: 35,
    },
    text: {
        fontWeight: Platform.OS === "ios" ? "500" : "400",
        fontSize: 16,
        marginLeft: 20,
        color: "#778287",
    },
    badgeText: {
        fontSize: Platform.OS === "ios" ? 13 : 11,
        fontWeight: "400",
        textAlign: "center",
        marginTop: Platform.OS === "android" ? -3 : undefined,
    },
    info: {
        position: "absolute",
        top:
            Platform.OS === "android"
                ? "$deviceHeight / 11"
                : "$deviceHeight / 11",
        left:
            Platform.OS === "android" ? "$deviceWidth / 4" : "$deviceWidth / 4",
    },
    userLabel: {
        fontWeight: "bold",
        color: "white",
        marginBottom: 3,
        fontSize: 13,
    },
    username: {
        fontWeight: "normal",
        color: "#e5e5e5",
        fontSize: 12,
        marginBottom: 3,
    },
});
