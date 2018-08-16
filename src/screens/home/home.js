/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
import React from "react";
import { StyleSheet, View, StatusBar, Dimensions } from "react-native";
import {
    Container,
    Header,
    Button,
    Left,
    Right,
    Text,
    Icon,
} from "native-base";
import FastImage from "react-native-fast-image";

// REDUX
import { connect } from "react-redux";
import { fetchAccount } from "../../redux/actions/userActions";
import store from "../../redux/store/Store";

// STEEM
import { getUserData, getAuthStatus } from "../../realm/Realm";

// SCREENS
import FeedPage from "./feed";
import HotPage from "./hot";
import TrendingPage from "./trending";

import ScrollableTabView from "react-native-scrollable-tab-view";
import CustomTabBar from "./FeedTabs";
import Placeholder from "rn-placeholder";

/* eslint-enable no-unused-vars */

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: {
                name: "null",
            },
            isLoggedIn: false,
            isLoading: true,
        };
    }

    async componentWillMount() {
        let user;
        let userData;
        let isLoggedIn;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                user = Array.from(res);
                this.props.fetchAccount(user[0].username);
                store.subscribe(() => {
                    userData = store.getState();
                    console.log(userData.account.data);
                    this.setState({
                        user: userData.account.data,
                        isLoggedIn: isLoggedIn,
                        isLoading: false,
                    });
                });
            });
        } else {
            await this.setState({
                isLoading: false,
            });
        }
    }

    render() {
        return (
            <Container style={{ flex: 1, top: StatusBar.currentHeight }}>
                <StatusBar translucent={true} backgroundColor={"transparent"} />
                <Header
                    noShadow
                    style={{
                        backgroundColor: "#284b78",
                        borderBottomWidth: 0,
                        borderColor: "#284b78",
                    }}
                >
                    <Left>
                        <Button
                            transparent
                            style={{ zIndex: 2 }}
                            onPress={() => this.props.navigation.toggleDrawer()}
                        >
                            <FastImage
                                square
                                small
                                source={{
                                    uri: `https://steemitimages.com/u/${
                                        this.state.user.name
                                    }/avatar/small`,
                                }}
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 15,
                                    borderWidth: 1,
                                    borderColor: "white",
                                }}
                            />
                        </Button>
                    </Left>
                    <Right>
                        <Button transparent>
                            <Icon
                                style={{ color: "white", fontWeight: "bold" }}
                                name="search"
                            />
                        </Button>
                    </Right>
                </Header>

                <ScrollableTabView
                    style={{
                        alignSelf: "center",
                        backgroundColor: "transparent",
                    }}
                    renderTabBar={() => (
                        <CustomTabBar
                            style={{
                                alignSelf: "center",
                                height: 40,
                                backgroundColor: "#284b78",
                            }}
                            tabUnderlineDefaultWidth={30} // default containerWidth / (numberOfTabs * 4)
                            tabUnderlineScaleX={3} // default 3
                            activeColor={"#fff"}
                            inactiveColor={"#fff"}
                        />
                    )}
                >
                    <View
                        tabLabel="Feed"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: "#f9f9f9",
                            flex: 1,
                            minWidth: Dimensions.get("window").width / 1,
                        }}
                    >
                        {this.state.isLoading ? (
                            <View>
                                <View style={styles.placeholder}>
                                    <Placeholder.ImageContent
                                        size={60}
                                        animate="fade"
                                        lineNumber={4}
                                        lineSpacing={5}
                                        lastLineWidth="30%"
                                        onReady={this.state.isReady}
                                    />
                                </View>
                                <View style={styles.placeholder}>
                                    <Placeholder.ImageContent
                                        size={60}
                                        animate="fade"
                                        lineNumber={4}
                                        lineSpacing={5}
                                        lastLineWidth="30%"
                                        onReady={this.state.isReady}
                                    />
                                </View>
                                <View style={styles.placeholder}>
                                    <Placeholder.ImageContent
                                        size={60}
                                        animate="fade"
                                        lineNumber={4}
                                        lineSpacing={5}
                                        lastLineWidth="30%"
                                        onReady={this.state.isReady}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={{ alignItems: "center" }}>
                                {this.state.isLoggedIn ? null : (
                                    <Button
                                        light
                                        onPress={() =>
                                            this.props.navigation.navigate(
                                                "Login"
                                            )
                                        }
                                        style={{
                                            alignSelf: "center",
                                            marginTop: 100,
                                        }}
                                    >
                                        <Text>
                                            Login to setup your custom Feed!
                                        </Text>
                                    </Button>
                                )}
                            </View>
                        )}
                        {this.state.isLoggedIn ? (
                            <FeedPage
                                navigation={this.props.navigation}
                                user={this.state.user}
                                isLoggedIn={this.state.isLoggedIn}
                            />
                        ) : null}
                    </View>
                    <View
                        tabLabel="Hot"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: "#f9f9f9",
                            flex: 1,
                            minWidth: Dimensions.get("window").width / 1,
                        }}
                    >
                        <HotPage
                            navigation={this.props.navigation}
                            user={this.state.user}
                            isLoggedIn={this.state.isLoggedIn}
                        />
                    </View>
                    <View
                        tabLabel="Trending"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: "#f9f9f9",
                            flex: 1,
                            minWidth: Dimensions.get("window").width / 1,
                        }}
                    >
                        <TrendingPage
                            navigation={this.props.navigation}
                            user={this.state.user}
                            isLoggedIn={this.state.isLoggedIn}
                        />
                    </View>
                </ScrollableTabView>
            </Container>
        );
    }
}

/* eslint-disable no-unused-vars */
const styles = StyleSheet.create({
    container: {
        backgroundColor: "#F9F9F9",
        flex: 1,
    },
    tabs: {
        flex: 1,
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
});

function mapStateToProps(state) {
    return {
        account: state.account,
    };
}

export default connect(
    mapStateToProps,
    { fetchAccount }
)(HomePage);
