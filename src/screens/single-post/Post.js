import React from 'react';
import { Dimensions, StyleSheet, StatusBar } from 'react-native';
import {
    Container,
    CardItem,
    Thumbnail,
    Content,
    Header,
    View,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Text,
    Title,
} from 'native-base';
import HTMLView from 'react-native-htmlview';
import HTML from 'react-native-render-html';
import { Client } from 'dsteem';
const client = new Client('https://api.steemit.com');

import { parsePost, protocolUrl2Obj } from '../../utils/PostParser';

class SinglePostPage extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {}

    onLinkPress(evt, href, attribs) {
        let steemPost = href.match(
            /^https?:\/\/(.*)\/(.*)\/(@[\w\.\d-]+)\/(.*)/i
        );

        if (attribs.class === 'markdown-author-link') {
            this.props.navigation.navigate('Author', { author: href });
        } else if (steemPost.length > 3) {
            steemPost[3] = steemPost[3].replace('@', '');
            client.database
                .call('get_content', [steemPost[3], steemPost[4]])
                .then(result => {
                    let content = parsePost(result);
                    this.props.navigation.push('Post', { content: content });
                })
                .catch(err => {
                    alert(err);
                });
        }
    }

    alterNode(node) {
        if (node.name == 'img') {
            node.attribs.style = `max-width: ${Dimensions.get('window').width}`;
        } else if (node.name == 'iframe') {
            node.attribs.style = `max-width: ${Dimensions.get('window').width}`;
            node.attribs.style = `width: ${Dimensions.get('window').width}`;
            node.attribs.height = 200;
        }
    }

    render() {
        return (
            <Container style={{ top: StatusBar.currentHeight }}>
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
                        <Title />
                    </Body>
                    <Right>
                        <Button transparent>
                            <Icon name="bookmark" />
                        </Button>
                        <Button transparent>
                            <Icon name="more" />
                        </Button>
                    </Right>
                </Header>
                <Content>
                    <CardItem style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 0.2 }}>
                            <Thumbnail
                                style={{
                                    borderWidth: 1,
                                    borderColor: 'lightgray',
                                }}
                                source={{
                                    uri: this.props.navigation.state.params
                                        .content.avatar,
                                }}
                            />
                        </View>
                        <View style={{ flex: 0.4 }}>
                            <Text>
                                {
                                    this.props.navigation.state.params.content
                                        .author
                                }
                            </Text>
                            <Text note>
                                #
                                {
                                    this.props.navigation.state.params.content
                                        .category
                                }
                            </Text>
                        </View>
                        <View style={{ flex: 0.4, alignItems: 'flex-end' }}>
                            <Text note>
                                {
                                    this.props.navigation.state.params.content
                                        .created
                                }
                            </Text>
                        </View>
                    </CardItem>
                    <CardItem>
                        <Text style={{ fontWeight: 'bold' }}>
                            {this.props.navigation.state.params.content.title}
                        </Text>
                    </CardItem>
                    <HTML
                        html={this.props.navigation.state.params.content.body}
                        staticContentMaxWidth={
                            Dimensions.get('window').width - 20
                        }
                        onLinkPress={(evt, href, hrefatr) =>
                            this.onLinkPress(evt, href, hrefatr)
                        }
                        containerStyle={{ padding: 10 }}
                        textSelectable={true}
                        tagsStyles={styles}
                        ignoredTags={['script']}
                        debug={true}
                        alterNode={node => {
                            this.alterNode(node);
                        }}
                        imagesMaxWidth={Dimensions.get('window').width}
                    />
                </Content>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iframe: {
        maxWidth: Dimensions.get('window').width,
        marginVertical: 10,
        left: -10,
    },
    p: {},
    img: {
        left: -10,
        marginVertical: 10,
    },
});

export default SinglePostPage;
