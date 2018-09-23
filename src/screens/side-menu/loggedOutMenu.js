/* eslint-disable no-unused-vars */
import React, { Component } from "react";
import { Image } from "react-native";
import {
    Content,
    Text,
    List,
    ListItem,
    Icon,
    Container,
    Left,
    Right,
    Badge,
} from "native-base";
import styles from "./style";
import { Navigation } from "react-native-navigation";

const drawerCover = require("../../assets/drawer-cover.png");
const drawerImage = require("../../assets/esteem.png");
const datas = [
    {
        name: "Login",
        route: "Login",
        icon: "log-in",
        bg: "#C5F442",
    },
];

export default class LoggedOutSideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shadowOffsetWidth: 1,
            shadowRadius: 4,
        };
    }

    hideSideMenu() {
        Navigation.mergeOptions("Component14", {
            sideMenu: {
                ["right"]: {
                    visible: false,
                },
            },
        });
    }

    render() {
        return (
            <Container>
                <Content
                    bounces={false}
                    style={{ flex: 1, backgroundColor: "#fff" }}
                >
                    <Image source={drawerCover} style={styles.drawerCover} />
                    <Image
                        square
                        style={styles.drawerImage}
                        source={drawerImage}
                    />

                    <List
                        dataArray={datas}
                        renderRow={data => (
                            <ListItem
                                button
                                noBorder
                                onPress={() => {
                                    Navigation.push("tab1Stack", {
                                        component: {
                                            name: `navigation.eSteem.${
                                                data.route
                                            }`,
                                            passProps: {},
                                            options: {
                                                topBar: {
                                                    title: {},
                                                },
                                            },
                                        },
                                    });
                                    this.hideSideMenu();
                                }}
                            >
                                <Left>
                                    <Icon
                                        active
                                        name={data.icon}
                                        style={{
                                            color: "#777",
                                            fontSize: 26,
                                            width: 30,
                                        }}
                                    />
                                    <Text style={styles.text}>{data.name}</Text>
                                </Left>
                                {data.types && (
                                    <Right style={{ flex: 1 }}>
                                        <Badge
                                            style={{
                                                borderRadius: 3,
                                                height: 25,
                                                width: 72,
                                                backgroundColor: data.bg,
                                            }}
                                        >
                                            <Text style={styles.badgeText}>{`${
                                                data.types
                                            } Types`}</Text>
                                        </Badge>
                                    </Right>
                                )}
                            </ListItem>
                        )}
                    />
                </Content>
            </Container>
        );
    }
}
