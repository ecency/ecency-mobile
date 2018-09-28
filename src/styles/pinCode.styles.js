import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  title: {
    flex: 1,
    color: "#357ce6",
    fontSize: 20,
    fontWeight: "bold",
    alignSelf: "center",
  },
  logo: {
    marginTop: "$deviceHeight / 8",
    flex: 1,
  },
  forgotButtonText: {
    color: "#788187",
    fontSize: 14,
    marginTop: 25,
    alignSelf: "center",
    marginBottom: 25,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderColor: "#fff",
    borderRadius: 5,
    paddingLeft: 15,
    minWidth: "$deviceWidth / 2",
  },
  icon: {
    color: "#357ce6",
  },
});
