import EStyleSheet from "react-native-extended-stylesheet";
import { StatusBar } from "react-native";
export default EStyleSheet.create({
  container: {
    backgroundColor: "#F9F9F9",
    flex: 1,
    top: StatusBar.currentHeight,
  },
  placeholder: {
    backgroundColor: "white",
    padding: 20,
    borderStyle: "solid",
    borderWidth: 1,
    borderTopWidth: 1,
    borderColor: "#e2e5e8",
    borderRadius: 5,
    marginRight: 0,
    marginLeft: 0,
    marginTop: 10,
  },
  tabs: {
    position: "absolute",
    top: "$deviceWidth / 30",
    alignItems: "center",
  },
  flatlistFooter: {
    alignContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 40,
    borderColor: "#CED0CE",
  },
});
