import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    maxHeight: "$deviceHeight / 3",
    overflow: "hidden",
    backgroundColor: "#ffffff",
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
    marginTop: 20,
    left: 20,
  },
});
