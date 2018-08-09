/* eslint-disable no-unused-vars */
import React from 'react';
import { StatusBar, Dimensions } from 'react-native';

import moment from 'moment';
import FastImage from 'react-native-fast-image';

import ScrollableTabView from 'react-native-scrollable-tab-view';
import CustomTabBar from '../home/FeedTabs';
import DiscoverPage from '../discover/Discover';
import { getUser, getFollows } from '../../providers/steem/Dsteem';

import {
    Content,
    Card,
    CardItem,
    View,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Title,
    Text,
} from 'native-base';

import { getUserData, getAuthStatus } from '../../realm/Realm';
import store from '../../redux/store/Store';
/* eslint-enable no-unused-vars */

class ProfilePage extends React.Component {
    constructor() {
        super();
        this.state = {
            user: [],
            about: {},
            follows: {},
            isLoggedIn: false,
        };
    }

    async componentDidMount() {
        let isLoggedIn;
        let user;
        let userData;
        let follows;
        let about;

        await getAuthStatus().then(res => {
            isLoggedIn = res;
        });

        if (isLoggedIn == true) {
            await getUserData().then(res => {
                userData = Array.from(res);
            });

            await getFollows(userData[0].username).then(res => {
                follows = res;
            });

            user = await getUser(userData[0].username);
            about = JSON.parse(user.json_metadata);
            this.setState({
                user: user,
                isLoggedIn: isLoggedIn,
                follows: follows,
                about: about.profile,
            });
        }
    }

    render() {
        return (
            <View style={{ flex: 1, top: StatusBar.currentHeight }}>
                {this.state.isLoggedIn ? (
                    <View style={{ flex: 1 }}>
                        <Header
                            style={{
                                backgroundColor: 'transparent',
                                position: 'absolute',
                                top: StatusBar.currentHeight,
                            }}
                        >
                            <Left>
                                <Button transparent>
                                    <Icon name="menu" />
                                </Button>
                            </Left>
                            <Body>
                                <Title>{this.state.user.name}</Title>
                            </Body>
                            <Right>
                                <Button transparent>
                                    <Icon name="search" />
                                </Button>
                                <Button transparent>
                                    <Icon name="heart" />
                                </Button>
                                <Button transparent>
                                    <Icon name="more" />
                                </Button>
                            </Right>
                        </Header>
                        <Content
                            style={{ flex: 1, backgroundColor: '#f9f9f9' }}
                        >
                            <FastImage
                                style={{
                                    width: Dimensions.get('window').width,
                                    height: 160,
                                }}
                                source={{
                                    uri: this.state.about.cover_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <FastImage
                                style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 50,
                                    top: -50,
                                    borderWidth: 1,
                                    borderColor: 'white',
                                    alignSelf: 'center',
                                }}
                                source={{
                                    uri: this.state.about.profile_image,
                                    priority: FastImage.priority.high,
                                }}
                            />
                            <Body style={{ top: -40 }}>
                                <Text style={{ fontWeight: 'bold' }}>
                                    {this.state.user.name}
                                </Text>
                                <Text>{this.state.about.about}</Text>
                            </Body>
                            <Card
                                style={{
                                    marginTop: 0,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginBottom: 0,
                                }}
                            >
                                <CardItem
                                    style={{
                                        borderColor: 'lightgray',
                                        borderTopWidth: 1,
                                        borderBottomWidth: 1,
                                        flexDirection: 'row',
                                    }}
                                >
                                    <View style={{ flex: 0.3 }}>
                                        <Text>
                                            {this.state.user.post_count} Posts
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text>
                                            {this.state.follows.follower_count}{' '}
                                            Followers
                                        </Text>
                                    </View>
                                    <View style={{ flex: 0.4 }}>
                                        <Text>
                                            {this.state.follows.following_count}{' '}
                                            Following
                                        </Text>
                                    </View>
                                </CardItem>

                                <CardItem
                                    style={{
                                        flexDirection: 'row',
                                        borderBottomWidth: 0,
                                    }}
                                >
                                    <View style={{ flex: 0.5 }}>
                                        <Text
                                            style={{
                                                marginLeft: 20,
                                                alignSelf: 'flex-start',
                                            }}
                                        >
                                            <Icon
                                                style={{
                                                    fontSize: 20,
                                                    alignSelf: 'flex-start',
                                                }}
                                                name="md-pin"
                                            />
                                            {this.state.about.location}
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
                                                .utc(this.state.user.created)
                                                .local()
                                                .fromNow()}
                                        </Text>
                                    </View>
                                </CardItem>
                            </Card>
                            <View>
                                <ScrollableTabView
                                    style={{
                                        alignSelf: 'center',
                                        backgroundColor: 'transparent',
                                    }}
                                    renderTabBar={() => (
                                        <CustomTabBar
                                            style={{
                                                alignSelf: 'center',
                                                height: 40,
                                                backgroundColor: '#fff',
                                            }}
                                            tabUnderlineDefaultWidth={30} // default containerWidth / (numberOfTabs * 4)
                                            tabUnderlineScaleX={3} // default 3
                                            activeColor={'#222'}
                                            inactiveColor={'#222'}
                                        />
                                    )}
                                >
                                    <View
                                        tabLabel="Blog"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: '#f9f9f9',
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get('window').width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Comments"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: '#f9f9f9',
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get('window').width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Replies"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: '#f9f9f9',
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get('window').width /
                                                1,
                                        }}
                                    />
                                    <View
                                        tabLabel="Wallet"
                                        style={{
                                            paddingHorizontal: 7,
                                            backgroundColor: '#f9f9f9',
                                            flex: 1,
                                            minWidth:
                                                Dimensions.get('window').width /
                                                1,
                                        }}
                                    />
                                </ScrollableTabView>
                            </View>
                        </Content>
                    </View>
                ) : (
                    <View>
                        <Header style={{}}>
                            <Left>
                                <Button transparent>
                                    <Icon name="menu" />
                                </Button>
                            </Left>
                            <Body>
                                <Title />
                            </Body>
                            <Right>
                                <Button transparent>
                                    <Icon name="more" />
                                </Button>
                            </Right>
                        </Header>
                        <DiscoverPage />
                    </View>
                )}
            </View>
        );
    }
}

export default ProfilePage;
