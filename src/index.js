import { Navigation } from "react-native-navigation";
import { registerScreens } from "./screens";

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
