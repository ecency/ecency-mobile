import { Navigation } from "react-native-navigation";
import { Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;

export const goToAuthScreens = () =>
    Navigation.setRoot({
        root: {
            sideMenu: {
                right: {
                    component: {
                        name: "navigation.eSteem.SideMenuScreen",
                        passProps: {
                            side: "right",
                        },
                    },
                },
                center: {
                    bottomTabs: {
                        children: [
                            {
                                stack: {
                                    id: "tab1Stack",
                                    children: [
                                        {
                                            component: {
                                                name: "navigation.eSteem.Home",
                                                passProps: {
                                                    text:
                                                        "This is a side menu center screen tab 1",
                                                },
                                            },
                                        },
                                    ],
                                    options: {
                                        bottomTab: {
                                            iconInsets: {
                                                top: 6,
                                                left: 0,
                                                bottom: -6,
                                                right: 0,
                                            },
                                            icon: require("./assets/feed.png"),
                                            iconColor: "gray",
                                            selectedIconColor: "#222",
                                        },
                                    },
                                },
                            },
                            {
                                stack: {
                                    children: [
                                        {
                                            component: {
                                                name:
                                                    "navigation.eSteem.Notifications",
                                                passProps: {
                                                    text:
                                                        "This is a side menu center screen tab 2",
                                                },
                                            },
                                        },
                                    ],
                                    options: {
                                        bottomTab: {
                                            iconInsets: {
                                                top: 6,
                                                left: 0,
                                                bottom: -6,
                                                right: 0,
                                            },
                                            icon: require("./assets/notification.png"),
                                            iconColor: "gray",
                                            selectedIconColor: "#222",
                                        },
                                    },
                                },
                            },
                            {
                                stack: {
                                    children: [
                                        {
                                            component: {
                                                name:
                                                    "navigation.eSteem.Editor",
                                                passProps: {
                                                    text:
                                                        "This is a side menu center screen tab 3",
                                                },
                                            },
                                        },
                                    ],
                                    options: {
                                        bottomTab: {
                                            iconInsets: {
                                                top: 6,
                                                left: 0,
                                                bottom: -6,
                                                right: 0,
                                            },
                                            icon: require("./assets/add.png"),
                                            iconColor: "gray",
                                            selectedIconColor: "#222",
                                        },
                                    },
                                },
                            },
                            {
                                stack: {
                                    children: [
                                        {
                                            component: {
                                                name:
                                                    "navigation.eSteem.Wallet",
                                                passProps: {
                                                    text:
                                                        "This is a side menu center screen tab 3",
                                                },
                                            },
                                        },
                                    ],
                                    options: {
                                        bottomTab: {
                                            iconInsets: {
                                                top: 6,
                                                left: 0,
                                                bottom: -6,
                                                right: 0,
                                            },
                                            icon: require("./assets/wallet.png"),
                                            iconColor: "gray",
                                            selectedIconColor: "#222",
                                        },
                                    },
                                },
                            },
                            {
                                stack: {
                                    children: [
                                        {
                                            component: {
                                                name:
                                                    "navigation.eSteem.Wallet",
                                                passProps: {
                                                    text:
                                                        "This is a side menu center screen tab 3",
                                                },
                                            },
                                        },
                                    ],
                                    options: {
                                        bottomTab: {
                                            iconInsets: {
                                                top: 6,
                                                left: 0,
                                                bottom: -6,
                                                right: 0,
                                            },
                                            icon: require("./assets/wallet.png"),
                                            iconColor: "gray",
                                            selectedIconColor: "#222",
                                        },
                                    },
                                },
                            },
                        ],
                        options: {
                            bottomTab: {
                                tabBarShowLabels: "hidden",
                                textColor: "#AED581",
                                iconColor: "#AED581",
                                selectedTextColor: "gray",
                                selectedIconColor: "gray",
                                fontFamily: "HelveticaNeue-Italic",
                                fontSize: 13,
                            },
                        },
                    },
                },
                options: {
                    topBar: {
                        visible: true,
                        animate: true, // Controls whether TopBar visibility changes should be animated
                        hideOnScroll: false,
                        elevation: 0,
                        noBorder: true,
                        rightButtons: [
                            {
                                id: "search",
                                icon: require("./assets/search.png"),
                            },
                        ],
                    },
                    bottomTabs: {
                        titleDisplayMode: "alwaysHide",
                        visible: true,
                        animate: false, // Controls whether BottomTabs visibility changes should be animated
                    },
                    bottomTab: {
                        iconColor: "gray",
                        selectedIconColor: "#222",
                        textColor: "#1B4C77",
                        selectedTextColor: "#0f0",
                        fontFamily: "HelveticaNeue-Italic",
                        fontSize: 13,
                    },
                    sideMenu: {
                        right: {
                            width: deviceWidth / 1.4,
                        },
                    },
                    // _animations: {
                    // 	startApp: {
                    // 		y: {
                    // 			from: 1000,
                    // 			to: 0,
                    // 			duration: 500,
                    // 			interpolation: "accelerate",
                    // 		},
                    // 		alpha: {
                    // 			from: 0,
                    // 			to: 1,
                    // 			duration: 500,
                    // 			interpolation: "accelerate",
                    // 		},
                    // 	},
                    // 	push: {
                    // 		topBar: {
                    // 			id: "TEST",
                    // 			alpha: {
                    // 				from: 0,
                    // 				to: 1,
                    // 				duration: 500,
                    // 				interpolation: "accelerate",
                    // 			},
                    // 		},
                    // 		bottomTabs: {
                    // 			y: {
                    // 				from: 1000,
                    // 				to: 0,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 			alpha: {
                    // 				from: 0,
                    // 				to: 1,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 		},
                    // 		content: {
                    // 			y: {
                    // 				from: 1000,
                    // 				to: 0,
                    // 				duration: 500,
                    // 				interpolation: "accelerate",
                    // 			},
                    // 			alpha: {
                    // 				from: 0,
                    // 				to: 1,
                    // 				duration: 500,
                    // 				interpolation: "accelerate",
                    // 			},
                    // 		},
                    // 		waitForRender: false,
                    // 	},
                    // 	pop: {
                    // 		topBar: {
                    // 			id: "TEST",
                    // 			alpha: {
                    // 				from: 1,
                    // 				to: 0,
                    // 				duration: 500,
                    // 				interpolation: "accelerate",
                    // 			},
                    // 		},
                    // 		bottomTabs: {
                    // 			y: {
                    // 				from: 0,
                    // 				to: 100,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 			alpha: {
                    // 				from: 1,
                    // 				to: 0,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 		},
                    // 		content: {
                    // 			y: {
                    // 				from: 0,
                    // 				to: 1000,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 			alpha: {
                    // 				from: 1,
                    // 				to: 0,
                    // 				duration: 500,
                    // 				interpolation: "decelerate",
                    // 			},
                    // 		},
                    // 	},
                    // },
                },
            },
        },
    });

export const goToNoAuthScreens = () =>
    Navigation.setRoot({
        root: {
            stack: {
                id: "LoginScreen",
                children: [
                    {
                        // TODO before commit navigation.eSteem.Login
                        component: {
                            name: "navigation.eSteem.PinCode",
                        },
                    },
                ],
                options: {
                    topBar: {
                        visible: false,
                    },
                },
            },
        },
    });
