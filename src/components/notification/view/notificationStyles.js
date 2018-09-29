import EStyleSheet from "react-native-extended-stylesheet";

export default EStyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  notificationWrapper: {
    flex: 1,
    flexDirection: "row",
    width: "$deviceWidth",
    justifyContent: "space-between",
    alignItems: "center",
    height: 64,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    marginLeft: 24,
  },
  image: {
    width: 32,
    height: 32,
    borderRadius: 32 / 4,
    marginRight: 24,
  },
  body: {
    flexDirection: "column",
    flexGrow: 1,
    fontSize: 12,
    marginRight: 28,
    marginLeft: 16,
    alignSelf: "center",
    width: "$deviceWidth / 1.76",
  },
  titleWrapper: {
    flexDirection: "row",
  },
  name: {
    fontWeight: "bold",
  },
  title: {
    color: "#788187",
  },
  description: {
    color: "#3c4449",
    fontSize: 12,
    fontWeight: "500",
  },
  scrollView: {
    height: "$deviceHeight / 1.25",
  },
  isNewNotification: {
    backgroundColor: "#eaf2fc",
    borderTopWidth: 0.3,
    borderBottomWidth: 0.3,
    borderColor: "#e7e7e7",
  },
  hasNoAvatar: {
    backgroundColor: "#d8d8d8",
  },
  lineBreakItem: {
    flex: 1,
    flexDirection: "row",
  },
  lineBreakItemText: {
    fontSize: 9,
    color: "#788187",
    marginLeft: 25,
  },
  arrowIcon: {
    color: "#c1c5c7",
    fontSize: 18,
  },
});
