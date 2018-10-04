import React from 'react';
import {
  Container,
  Header,
  Left,
  Body,
  Right,
  Button,
  Icon,
  Title,
  Content,
} from 'native-base';
import { MarkdownEditor } from 'react-native-markdown-editor';
import {
  StatusBar,
  View,
  TextInput,
  TouchableOpacity,
  Text,
} from 'react-native';
import Tags from '@esteemapp/react-native-tags';
import { postContent } from '../../providers/steem/dsteem';
import { getUserData, getAuthStatus } from '../../realm/realm';
import { decryptKey } from '../../utils/crypto';

class EditorPage extends React.Component {
  constructor(props) {
    super(props);
    this.onChangeBody = this.onChangeBody.bind(this);
    this.onChangeTitle = this.onChangeTitle.bind(this);
    this.onChangeTags = this.onChangeTags.bind(this);

    this.state = {
      body: '',
      title: '',
      author: '',
      permlink: '',
      tags: ['esteem'],
    };
  }

  componentDidMount() {}

    onChangeBody = (body) => {
      this.setState({
        body,
      });
    };

    onChangeTitle = (title) => {
      this.setState({
        title,
      });
    };

    onChangeTags = (tags) => {
      this.setState({
        tags,
      });
    };

    generatePermlink = () => {
      let title;

      title = this.state.title
        .replace(/[^\w\s]/gi, '')
        .replace(/\s\s+/g, '-')
        .replace(/\s/g, '-')
        .toLowerCase();
      title = `${title
      }-id-${
        Math.random()
          .toString(36)
          .substr(2, 16)}`;

      return title;
    };

    submitPost = async () => {
      let userData;
      let postingKey;

      await getUserData().then((res) => {
        userData = Array.from(res);
        postingKey = decryptKey(userData[0].postingKey, 'pinCode');
      });

      post = {
        body: this.state.body,
        title: this.state.title,
        author: userData[0].username,
        permlink: this.generatePermlink(),
        tags: this.state.tags,
      };

      console.log(post);

      postContent(post, postingKey)
        .then((result) => {
          console.log(result);
        })
        .catch((error) => {
          console.log(error);
        });
    };

    render() {
      return (
        <Container style={{ flex: 1 }}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            <TextInput
              placeholder="Title"
              onChangeText={title => this.onChangeTitle(title)}
              style={{
                borderWidth: 1,
                borderColor: 'lightgray',
                height: 40,
                margin: 10,
                borderRadius: 10,
                flex: 0.08,
              }}
            />
            <Tags
              initialText=""
              initialTags={this.state.tags}
              onChangeTags={tags => this.onChangeTags(tags)}
              onTagLongPress={(index, tagLabel, event, deleted) => console.log(
                index,
                tagLabel,
                event,
                deleted ? 'deleted' : 'not deleted',
              )
                        }
              containerStyle={{ justifyContent: 'center' }}
              inputStyle={{ backgroundColor: 'white' }}
              maxNumberOfTags={5}
              tagContainerStyle={{
                height: 25,
                backgroundColor: '#284b78',
              }}
              tagTextStyle={{ fontWeight: '600', color: 'white' }}
              style={{
                borderWidth: 1,
                borderColor: 'lightgray',
                flex: 0.12,
              }}
            />
            <View style={{ borderRadius: 10, flex: 0.7 }}>
              <MarkdownEditor
                onMarkdownChange={(text) => {
                  this.onChangeBody(text);
                }}
              />
            </View>

            <View style={{ flex: 0.1, flexDirection: 'row' }}>
              <View style={{ flex: 0.7 }}>
                <Text>Options</Text>
              </View>
              <View style={{ flex: 0.3 }}>
                <TouchableOpacity
                  onPress={this.submitPost}
                  style={{
                    borderRadius: 10,
                    backgroundColor: '#284b78',
                    width: 100,
                    height: 20,
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',
                      alignSelf: 'center',
                    }}
                  >
                                    Submit
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Container>
      );
    }
}

export default EditorPage;
