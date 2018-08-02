import React, { Component } from 'react';
import { StyleSheet, Image, TouchableOpacity } from 'react-native';

import {
    Button,
    Card,
    CardItem,
    Left,
    Right,
    Thumbnail,
    View,
    Icon,
    Body,
    Text,
    Container,
    Content,
} from 'native-base';

class PostCard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};
    }

    componentDidMount() {}

    onError() {}

    render() {
        return (
            <Card style={styles.post}>
                <CardItem style={styles.header}>
                    <Left>
                        <TouchableOpacity
                            onPress={() =>
                                this.props.navigate('Author', {
                                    author: this.props.content.author,
                                })
                            }
                        >
                            <Thumbnail
                                style={styles.avatar}
                                source={{ uri: this.props.content.avatar }}
                            />
                        </TouchableOpacity>
                        <Body style={styles.body}>
                            <View style={styles.author}>
                                <Text style={styles.authorName}>
                                    {this.props.content.author}
                                </Text>
                            </View>
                            <View style={styles.badge}>
                                <Text style={styles.text}>
                                    {this.props.content.author_reputation}
                                </Text>
                            </View>
                            <View style={styles.category}>
                                <Text style={styles.categoryText}>
                                    {this.props.content.category}
                                </Text>
                            </View>
                            <Text style={styles.timeAgo} note>
                                {' '}
                                {this.props.content.created}{' '}
                            </Text>
                        </Body>
                    </Left>
                    <Right>
                        <Icon name="md-more" />
                    </Right>
                </CardItem>
                <Image
                    source={{ uri: this.props.content.image }}
                    defaultSource={require('../../assets/no_image.png')}
                    style={styles.image}
                />
                <TouchableOpacity
                    onPress={() =>
                        this.props.navigate('Post', {
                            content: this.props.content,
                        })
                    }
                >
                    <CardItem>
                        <Body>
                            <Text style={styles.title}>
                                {this.props.content.title}
                            </Text>
                            <Text style={styles.summary}>
                                {this.props.content.summary}
                            </Text>
                        </Body>
                    </CardItem>
                </TouchableOpacity>
                <CardItem>
                    <Left>
                        <TouchableOpacity start style={styles.upvoteButton}>
                            <Icon
                                style={styles.upvoteIcon}
                                active
                                name="ios-arrow-dropup-outline"
                            />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.payoutButton}>
                            <Text style={styles.payout}>
                                ${this.props.content.pending_payout_value}
                            </Text>
                            <Icon
                                name="md-arrow-dropdown"
                                style={styles.payoutIcon}
                            />
                        </TouchableOpacity>
                    </Left>
                    <Right>
                        <TouchableOpacity start style={styles.commentButton}>
                            <Icon
                                style={styles.commentIcon}
                                active
                                name="ios-chatbubbles-outline"
                            />
                            <Text style={styles.comment}>
                                {this.props.content.children}
                            </Text>
                        </TouchableOpacity>
                    </Right>
                </CardItem>
                {this.props.content.top_likers ? (
                    <CardItem style={styles.topLikers}>
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[0]
                                }/avatar/small`,
                            }}
                            style={styles.likers_1}
                        />
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[1]
                                }/avatar/small`,
                            }}
                            style={styles.likers_2}
                        />
                        <Thumbnail
                            source={{
                                uri: `https://steemitimages.com/u/${
                                    this.props.content.top_likers[2]
                                }/avatar/small`,
                            }}
                            style={styles.likers_3}
                        />
                        <Text style={styles.footer}>
                            @{this.props.content.top_likers[0]}, @
                            {this.props.content.top_likers[1]}, @
                            {this.props.content.top_likers[2]}
                            <Text style={styles.footer}> & </Text>
                            {this.props.content.vote_count -
                                this.props.content.top_likers.length}{' '}
                            others like this
                        </Text>
                    </CardItem>
                ) : (
                    <CardItem>
                        <Text style={styles.footer}>
                            {this.props.content.vote_count} likes
                        </Text>
                    </CardItem>
                )}
            </Card>
        );
    }
}
const styles = StyleSheet.create({
    post: {
        shadowColor: 'white',
        padding: 0,
        marginRight: 0,
        marginLeft: 0,
        marginTop: 0,
        marginBottom: 0,
        borderWidth: 0,
        borderColor: 'white',
        borderRadius: 5,
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderColor: 'lightgray',
        borderWidth: 1,
    },
    author: {
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        paddingVertical: 5,
    },
    timeAgo: {
        alignSelf: 'center',
        fontSize: 9,
        fontWeight: '100',
        marginHorizontal: 3,
    },
    authorName: {
        color: '#222',
        fontWeight: '600',
        fontSize: 10,
    },
    upvoteButton: {
        margin: 0,
        flexDirection: 'row',
        paddingVertical: 0,
    },
    upvoteIcon: {
        alignSelf: 'flex-start',
        fontSize: 20,
        color: '#007ee5',
        margin: 0,
        width: 18,
    },
    payout: {
        alignSelf: 'center',
        fontSize: 10,
        color: '#626262',
        marginLeft: 3,
    },
    payoutIcon: {
        fontSize: 15,
        marginHorizontal: 3,
        color: '#a0a0a0',
        alignSelf: 'center',
    },
    payoutButton: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingVertical: 2,
    },
    commentButton: {
        padding: 0,
        margin: 0,
        flexDirection: 'row',
    },
    comment: {
        alignSelf: 'center',
        fontSize: 10,
        color: '#626262',
        marginLeft: 3,
    },
    commentIcon: {
        alignSelf: 'flex-start',
        fontSize: 20,
        color: '#007ee5',
        margin: 0,
        width: 20,
    },
    title: {
        fontSize: 12,
        fontWeight: '500',
        marginVertical: 5,
    },
    summary: {
        fontSize: 10,
        fontWeight: '200',
        overflow: 'hidden',
    },
    header: {
        height: 50,
    },
    body: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
    },
    image: {
        margin: 0,
        width: '100%',
        height: 160,
    },
    badge: {
        alignSelf: 'center',
        borderColor: 'lightgray',
        borderWidth: 1,
        borderRadius: 10,
        width: 15,
        height: 15,
        padding: 2,
        backgroundColor: 'lightgray',
        marginHorizontal: 5,
    },
    category: {
        alignSelf: 'center',
        borderRadius: 10,
        height: 15,
        backgroundColor: '#007EE5',
        paddingHorizontal: 5,
        paddingVertical: 1.5,
    },
    categoryText: {
        fontSize: 9,
        color: 'white',
        fontWeight: '600',
    },
    text: {
        fontSize: 7,
        alignSelf: 'center',
        textAlignVertical: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
    topLikers: {
        backgroundColor: '#f8f8f8',
        borderWidth: 0,
        padding: 0,
    },
    likers_1: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: 'lightgray',
        marginVertical: -5,
    },
    likers_2: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: 'lightgray',
        marginVertical: -5,
        marginLeft: -3,
    },
    likers_3: {
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 0.5,
        borderColor: 'lightgray',
        marginVertical: -5,
        marginLeft: -3,
    },
    footer: {
        marginLeft: 5,
        fontSize: 7,
        fontWeight: '100',
        color: '#777777',
    },
});

export default PostCard;
