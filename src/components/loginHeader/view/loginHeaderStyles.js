import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    height: "$deviceHeight / 3",
  },
  body: {
    flexDirection: "row",
    maxHeight: "$deviceHeight / 3",
    overflow: "hidden",
    backgroundColor: "$white",
  },
  description: {
    textAlignVertical: "center",
    color: "#788187",
    fontSize: 14,
    fontWeight: "400",
  },
  title: {
    textAlignVertical: "center",
    fontSize: 20,
    fontWeight: "bold",
    color: "#788187",
    marginBottom: 16,
  },
  mascot: {
    width: 217,
    height: 300,
    marginLeft: 50,
    marginTop: 40,
  },
  titleText: {
    flex: 0.4,
    alignSelf: "center",
    height: 100,
    marginTop: 50,
    marginLeft: 32,
  },
  headerRow: {
    width: "$deviceWidth",
    flexDirection: "row",
    height: 55,
    justifyContent: "space-between",
  },
  logo: {
    width: 32,
    height: 32,
    marginLeft: 32,
    alignSelf: "center",
  },
  headerButton: {
    margin: 10,
    marginRight: 19,
    alignSelf: "center",
  },
});
