import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
    tab: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    tabs: {
        height: 50,
        flexDirection: "row",
        justifyContent: "space-around",
        borderWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        borderColor: "#f4f4f4",
    },
    tabButton: {
        flex: 1,
    },
    tabButtonText: {},
});
