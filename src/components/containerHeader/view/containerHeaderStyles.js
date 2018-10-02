import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  wrapper: {
    width: "$deviceWidth",
    height: 50,
    backgroundColor: "$white",
    borderTopColor: "#cfcfcf",
    justifyContent: "center",
    borderTopColor: "#e7e7e7",
    borderTopWidth: 1,
  },
  title: {
    alignSelf: "flex-start",
    fontSize: 14,
    color: "$primaryGray",
    fontWeight: "bold",
    marginLeft: 26,
  },
});
