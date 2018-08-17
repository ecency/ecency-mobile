import React from "react";
import { StatusBar, Dimensions } from "react-native";
import {
    Container,
    Card,
    CardItem,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Content,
    Text,
    View,
} from "native-base";
import { getAccount } from "../../providers/steem/Dsteem";
import ScrollableTabView from "react-native-scrollable-tab-view";
import CustomTabBar from "../home/FeedTabs";
import moment from "moment";
import FastImage from "react-native-fast-image";

import Theme, { createThemedComponent } from "react-native-theming";
import styles from "../../styles/author.styles";
import themes from "../../styles/themes";

const Bar = createThemedComponent(StatusBar, ["barStyle", "backgroundColor"]);

class AuthorPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            author: "author",
            about: {},
            follows: {},
        };
    }

    componentDidMount() {
        /*for (var i = 0; i < themes.length; i++) {
            themes[i].name == 'Light'?themes[0].apply():'';
        }*/
        let info;
        let json_metadata;
        getAccount(this.props.navigation.state.params.author)
            .then(author => {
                json_metadata = JSON.parse(author[0].json_metadata);
                info = json_metadata.profile;
                this.setState({
                    author: author[0],
                    about: info,
                });
            })
            .catch(err => {});
    }

    render() {
        return (
            <Container style={styles.container}>
                <Header>
                    <Left>
                        <Button
                            transparent
                            onPress={() => this.props.navigation.goBack()}
                        >
                            <Icon name="arrow-back" />
                        </Button>
                    </Left>
                    <Body>
                        <Title> {this.state.author.name} </Title>
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="heart" />
                        </Button>
                        <Button transparent>
                            <Icon name="more" />
                        </Button>
                    </Right>
                </Header>

                <Content>
                    <View style={styles.view}>
                        <Content style={styles.content}>
                            <FastImage
                                style={styles.coverImage}
                                source={{
                                    uri: this.state.about.cover_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <FastImage
                                style={styles.profileImage}
                                source={{
                                    uri: this.state.about.profile_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <Body style={styles.accountNameBody}>
                                <Text style={styles.accountNameText}>
                                    {this.state.author.name}
                                </Text>
                                <Text>{this.state.about.about}</Text>
                            </Body>
                            <Card style={styles.userDetailsCard}>
                                <CardItem style={styles.userDetail}>
                                    <View style={{ flex: 0.3 }}>
                                        <Text>
                                            {this.state.author.post_count} Posts
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text> Followers</Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text> Following</Text>
                                    </View>
                                </CardItem>

                                <CardItem
                                    style={{
                                        flexDirection: "row",
                                        borderBottomWidth: 0,
                                    }}
                                >
                                    <View style={{ flex: 0.5 }}>
                                        <Text
                                            style={{
                                                marginLeft: 20,
                                                alignSelf: "flex-start",
                                            }}
                                        >
                                            <Icon
                                                style={{
                                                    fontSize: 20,
                                                    alignSelf: "flex-start",
                                                    right: 10,
                                                }}
                                                name="md-pin"
                                            />
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.5 }}>
                                        <Text>
                                            <Icon
                                                style={{
                                                    fontSize: 20,
                                                    marginRight: 10,
                                                }}
                                                name="md-calendar"
                                            />
                                            {moment
                                                .utc(this.state.author.created)
                                                .local()
                                                .fromNow()}
                                        </Text>
                                    </View>
                                </CardItem>
                            </Card>
                            <View>
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
                                                backgroundColor: "#fff",
                                            }}
                                            tabUnderlineDefaultWidth={30} // default containerWidth / (numberOfTabs * 4)
                                            tabUnderlineScaleX={3} // default 3
                                            activeColor={"#222"}
                                            inactiveColor={"#222"}
                                        />
                                    )}
                                >
                                    <View
                                        tabLabel="Blog"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: "#f9f9f9",
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get("window").width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Comments"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: "#f9f9f9",
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get("window").width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Replies"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: "#f9f9f9",
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get("window").width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Wallet"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: "#f9f9f9",
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get("window").width /
                                                1,
                                        }}
                                    />
                                </ScrollableTabView>
                            </View>
                        </Content>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default AuthorPage;
