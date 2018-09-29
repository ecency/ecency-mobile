import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flexDirection: "row",
    alignSelf: "center",
  },
  activeInput: {
    backgroundColor: "$primaryBlue",
  },
  input: {
    alignItems: "center",
    justifyContent: "center",
    height: 20,
    margin: 5,
    width: 20,
    borderRadius: 20 / 2,
    borderWidth: 1,
    borderColor: "$primaryBlue",
    backgroundColor: "#fff",
  },
});
