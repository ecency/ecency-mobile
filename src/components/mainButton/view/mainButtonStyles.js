import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  wrapper: {},
  touchable: {
    //maxWidth: 200,
    //width: 150,
    maxWidth: 200,
    minWidth: 100,
    height: 56,
    borderRadius: 30,
    backgroundColor: "#357ce6",
    flexDirection: "row",
    margin: 5,
    shadowOffset: {
      height: 5,
    },
    shadowColor: "#5f5f5fbf",
    shadowOpacity: 0.3,
  },
  icon: {
    alignSelf: "center",
    fontSize: 25,
    marginLeft: 20,
  },
  text: {
    color: "white",
    fontWeight: "400",
    alignSelf: "center",
    fontSize: 14,
    paddingLeft: 10,
    paddingRight: 20,
  },
  secondText: {
    fontWeight: "bold",
  },
  activityIndicator: { alignSelf: "center", flex: 1 },
  body: { flexDirection: "row" },
});
