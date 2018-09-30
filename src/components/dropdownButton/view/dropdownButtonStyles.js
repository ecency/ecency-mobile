import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "flex-start",
    height: 35,
  },
  dropdownWrapper: {},
  dropdownText: {
    fontSize: 9,
    color: "#788187",
    marginLeft: 25,
  },
  dropdownIcon: {
    fontSize: 18,
    color: "#c1c5c7",
    marginLeft: 7,
    marginTop: 1,
  },
  dropdown: {
    marginTop: 5,
    marginLeft: -2,
    minWidth: "$deviceWidth / 2",
    borderColor: "#e7e7e7",
  },
  iconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 9,
    color: "#788187",
    padding: 5,
    borderColor: "#e7e7e7",
  },
  dropdownTextHighlight: {
    backgroundColor: "#387be5",
    width: "$deviceWidth / 3",
  },
  button: {
    marginLeft: 25,
  },
  buttonText: {
    fontSize: 9,
    alignSelf: "center",
    color: "#788187",
    fontWeight: "normal",
  },
});
