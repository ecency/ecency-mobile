import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  textWithIconWrapper: {
    justifyContent: "center",
    flexDirection: "row",
  },
  longImage: {
    borderRadius: 5,
    height: 60,
    marginTop: 16,
    marginBottom: 12,
    alignSelf: "stretch",
    maxWidth: "$deviceWidth - 24",
    backgroundColor: "#296CC0",
  },
  percentTitleWrapper: {
    flexDirection: "row",
    justifyContent: "center",
  },
  percentTitle: {
    color: "$primaryBlue",
    fontSize: 11,
  },
  footer: {
    width: "$deviceWidth - 24",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 17,
    marginTop: 10,
  },
  leftIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  rightIcons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  insetIconStyle: {
    marginRight: 12,
  },
  followCountWrapper: {
    flexDirection: "column",
    marginRight: 40,
  },
  followCount: {
    fontWeight: "bold",
    color: "$primaryDarkGray",
    fontSize: 14,
    textAlign: "center",
  },
  followText: {
    textAlign: "center",
    color: "$primaryDarkGray",
    fontSize: 9,
  },
  // TODO: look at here
  dropdownIconStyle: {
    marginBottom: 7,
  },
});
