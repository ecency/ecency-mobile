import { Navigation } from "react-native-navigation";
import { registerScreens } from "./screens";
import { StatusBar, Dimensions } from "react-native";

// STYLE
import EStyleSheet from "react-native-extended-stylesheet";

EStyleSheet.build({
    // Primary Colors
    $white: "#FFFFFF",
    $black: "#000000",
    $primaryBlue: "#357ce6",
    $primaryGray: "#788187",
    $primaryLightGray: "#f6f6f6",
    $primaryRed: "#e63535",

    // General Colors
    $borderColor: "#ffff",
    $bubblesBlue: "#5CCDFF",
    $iconColor: "#c1c5c7",
    $dangerColor: "#fff",
    $warningColor: "#fff",
    $successColor: "#fff",
    $disableButton: "#fff",
    $shadowColor: "#fff",
    $disableGray: "#fff",

    // Devices Sizes
    $deviceHeight: Dimensions.get("window").height,
    $deviceWidth: Dimensions.get("window").width,

    // Fonts Properties
    $primaryFont: "Roboto",
    $primaryLatterSpacing: 0,
});

registerScreens();

Navigation.events().registerAppLaunchedListener(() => {
    Navigation.setRoot({
        root: {
            component: {
                name: "navigation.eSteem.Splash",
            },
        },
    });
});
