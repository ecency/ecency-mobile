import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  h2text: {
    marginTop: 10,

    color: "black",
    fontSize: 36,
    fontWeight: "bold",
  },
  flatview: {
    justifyContent: "center",
    paddingTop: 30,
    borderRadius: 2,
  },
  name: {
    fontFamily: "Verdana",
    fontSize: 18,
    color: "red",
  },
  email: {
    color: "red",
  },
  flatListWrapper: {
    flex: 1,
    flexDirection: "column",
  },
});
