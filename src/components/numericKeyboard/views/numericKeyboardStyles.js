import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: "$deviceWidth / 1.8",
  },
  buttonGroup: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lastButtonGroup: {
    width: "63%",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignSelf: "flex-end",
  },
  iconButton: {
    fontSize: 20,
    color: "$primaryBlue",
  },
});
