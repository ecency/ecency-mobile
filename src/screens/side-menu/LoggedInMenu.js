import React from 'react';
/* eslint-disable no-unused-vars */
import {
    Content,
    Text,
    List,
    ListItem,
    Icon,
    Container,
    Left,
    Right,
    View,
    Badge,
    Thumbnail,
} from 'native-base';
/* eslint-enable no-unused-vars */
import styles from './style';

import FastImage from 'react-native-fast-image';
import { getAccount } from '../../providers/steem/Dsteem';
import { removeUserData } from '../../realm/Realm';
import RNRestart from 'react-native-restart';

const masterKeyMenuOptions = [
    {
        name: 'Home',
        route: 'Home',
        icon: 'home',
        bg: '#C5F442',
    },
    {
        name: 'Bookmarks',
        route: 'bookmarks',
        icon: 'bookmarks',
        bg: '#DA4437',
    },
    {
        name: 'Drafts',
        route: 'drafts',
        icon: 'create',
        bg: '#DA4437',
    },
    {
        name: 'Favorites',
        route: 'favorites',
        icon: 'heart',
        bg: '#DA4437',
    },
    {
        name: 'Schedules',
        route: 'schedules',
        icon: 'time',
        bg: '#DA4437',
    },
    {
        name: 'Transfer',
        route: 'transfer',
        icon: 'md-send',
        bg: '#DA4437',
    },
    {
        name: 'Exchange',
        route: 'exchange',
        icon: 'repeat',
        bg: '#DA4437',
    },
    {
        name: 'Marketplace',
        route: 'marketplace',
        icon: 'cube',
        bg: '#DA4437',
    },
    {
        name: 'Settings',
        route: 'settings',
        icon: 'settings',
        bg: '#DA4437',
    },
    {
        name: 'FAQ',
        route: 'faq',
        icon: 'ios-information-circle-outline',
        bg: '#DA4437',
    },
    {
        name: 'About',
        route: 'about',
        icon: 'information-circle',
        bg: '#DA4437',
    },
];

const postingKeyMenuOptions = [
    {
        name: 'Home',
        route: 'Home',
        icon: 'home',
        bg: '#C5F442',
    },
    {
        name: 'Bookmarks',
        route: 'bookmarks',
        icon: 'bookmarks',
        bg: '#DA4437',
    },
    {
        name: 'Drafts',
        route: 'drafts',
        icon: 'create',
        bg: '#DA4437',
    },
    {
        name: 'Favorites',
        route: 'favorites',
        icon: 'heart',
        bg: '#DA4437',
    },
    {
        name: 'Schedules',
        route: 'schedules',
        icon: 'time',
        bg: '#DA4437',
    },
    {
        name: 'Marketplace',
        route: 'marketplace',
        icon: 'cube',
        bg: '#DA4437',
    },
    {
        name: 'Settings',
        route: 'settings',
        icon: 'settings',
        bg: '#DA4437',
    },
    {
        name: 'FAQ',
        route: 'faq',
        icon: 'ios-information-circle-outline',
        bg: '#DA4437',
    },
    {
        name: 'About',
        route: 'about',
        icon: 'information-circle',
        bg: '#DA4437',
    },
];

export class LoggedInSideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shadowOffsetWidth: 1,
            shadowRadius: 4,
            user: [],
            loginType: '',
            json_metadata: {},
        };
    }

    componentDidMount() {
        getAccount(this.props.navigation.state.params.account)
            .then(result => {
                let json_metadata = JSON.parse(result[0].json_metadata);
                this.setState({
                    user: result[0],
                    avatar: `https://steemitimages.com/u/${
                        result[0].name
                    }/avatar/small`,
                    json_metadata: json_metadata.profile,
                });
            })
            .catch(err => {
                alert(err);
            });
    }

    Logout = () => {
        removeUserData()
            .then(() => {
                RNRestart.Restart();
            })
            .catch(err => {
                alert(err);
            });
    };

    render() {
        return (
            <Container>
                <Content
                    bounces={false}
                    style={{ flex: 1, backgroundColor: '#fff', top: -1 }}
                >
                    <FastImage
                        source={{
                            uri: this.state.json_metadata.cover_image,
                            priority: FastImage.priority.high,
                        }}
                        style={styles.drawerCover}
                    />
                    <Thumbnail
                        style={styles.drawerImage}
                        source={{ uri: this.state.avatar }}
                    />
                    <View style={styles.info}>
                        <Text style={styles.userLabel}>
                            {this.state.json_metadata.name || ''}
                        </Text>
                        <Text style={styles.userLabel}>
                            {this.state.user.name}
                        </Text>
                    </View>
                    <List
                        dataArray={
                            this.state.loginType === 'master_key'
                                ? masterKeyMenuOptions
                                : postingKeyMenuOptions
                        }
                        renderRow={data => (
                            <ListItem
                                button
                                noBorder
                                onPress={() =>
                                    this.props.navigation.navigate(data.route)
                                }
                            >
                                <Left>
                                    <Icon
                                        active
                                        name={data.icon}
                                        style={{
                                            color: '#777',
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
                    <ListItem noBorder onPress={() => this.Logout()}>
                        <Left>
                            <Icon
                                active
                                name="log-out"
                                style={{
                                    color: '#777',
                                    fontSize: 26,
                                    width: 30,
                                }}
                            />
                            <Text style={styles.text}>Logout</Text>
                        </Left>
                    </ListItem>
                </Content>
            </Container>
        );
    }
}
