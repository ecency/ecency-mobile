import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    justifyContent: "center",
  },
  filterBarWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightIconWrapper: {
    alignSelf: "flex-end",
    marginRight: 32,
  },
  rightIcon: {
    color: "#c1c5c7",
    fontSize: 20,
  },
});
