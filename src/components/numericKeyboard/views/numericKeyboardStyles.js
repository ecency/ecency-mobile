import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    width: "$deviceWidth / 1.5",
  },
  buttonGroup: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  button: {
    marginBottom: 15,
  },
});
