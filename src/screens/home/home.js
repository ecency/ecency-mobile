import React from 'react';
import {
    StyleSheet,
    View,
    AsyncStorage,
    StatusBar,
    Dimensions,
} from 'react-native';
import {
    Container,
    Header,
    Button,
    Left,
    Thumbnail,
    Right,
    Text,
    Tabs,
    Tab,
    Icon,
    ScrollableTab,
} from 'native-base';

// STEEM
import { getAccount } from '../../providers/steem/Dsteem';

// SCREENS
import FeedPage from './feed';
import HotPage from './hot';
import TrendingPage from './trending';

import ScrollableTabView, {
    DefaultTabBar,
    ScrollableTabBar,
} from 'react-native-scrollable-tab-view';
import CustomTabBar from './CustomTabBar';

class HomePage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            user: [],
            isLoggedIn: false,
        };
    }

    componentDidMount() {
        AsyncStorage.getItem('isLoggedIn').then(result => {
            let res = JSON.parse(result);
            if (res) {
                this.setState(
                    {
                        isLoggedIn: true,
                    },
                    () => {
                        AsyncStorage.getItem('user').then(result => {
                            let user = JSON.parse(result);
                            getAccount(user.username).then(result => {
                                this.setState(
                                    {
                                        user: result[0],
                                    },
                                    () => {}
                                );
                            });
                        });
                    }
                );
            }
        });
    }

    render() {
        const { navigate } = this.props.navigation;
        return (
            <Container style={{ flex: 1, top: StatusBar.currentHeight }}>
                <StatusBar translucent={true} backgroundColor={'transparent'} />
                <Header
                    noShadow
                    style={{
                        backgroundColor: '#284b78',
                        borderBottomWidth: 0,
                        borderColor: '#284b78',
                    }}
                >
                    <Left>
                        <Button
                            transparent
                            style={{ zIndex: 2 }}
                            onPress={() => this.props.navigation.toggleDrawer()}
                        >
                            <Thumbnail
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
                                    borderColor: 'white',
                                }}
                            />
                        </Button>
                    </Left>
                    <Right>
                        <Button transparent>
                            <Icon
                                style={{ color: 'white', fontWeight: 'bold' }}
                                name="search"
                            />
                        </Button>
                    </Right>
                </Header>

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
                                backgroundColor: '#284b78',
                            }}
                            tabUnderlineDefaultWidth={30} // default containerWidth / (numberOfTabs * 4)
                            tabUnderlineScaleX={3} // default 3
                            activeColor={'#fff'}
                            inactiveColor={'#fff'}
                        />
                    )}
                >
                    <View
                        tabLabel="Feed"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: '#f9f9f9',
                            flex: 1,
                            minWidth: Dimensions.get('window').width / 1,
                        }}
                    >
                        {this.state.isLoggedIn ? (
                            <FeedPage navigation={navigate} />
                        ) : (
                            <View style={{ alignItems: 'center' }}>
                                <Button
                                    light
                                    onPress={() =>
                                        this.props.navigation.navigate('Login')
                                    }
                                    style={{
                                        alignSelf: 'center',
                                        marginTop: 100,
                                    }}
                                >
                                    <Text>
                                        Login to setup your custom Feed!
                                    </Text>
                                </Button>
                            </View>
                        )}
                    </View>
                    <View
                        tabLabel="Hot"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: '#f9f9f9',
                            flex: 1,
                            minWidth: Dimensions.get('window').width / 1,
                        }}
                    >
                        <HotPage navigation={navigate} />
                    </View>
                    <View
                        tabLabel="Trending"
                        style={{
                            paddingHorizontal: 7,
                            backgroundColor: '#f9f9f9',
                            flex: 1,
                            minWidth: Dimensions.get('window').width / 1,
                        }}
                    >
                        <TrendingPage navigation={navigate} />
                    </View>
                </ScrollableTabView>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F9F9F9',
        flex: 1,
    },
    tabs: {
        flex: 1,
    },
});

export default HomePage;
