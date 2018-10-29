import React, { Component } from 'react';
import { View, Dimensions, Linking } from 'react-native';
import HTML from 'react-native-html-renderer';
// Styles
import styles from './postBodyStyles';
// Components

const WIDTH = Dimensions.get('window').width;
// Constants

class PostBody extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  // alterNode(node) {
  //   // if (node.name === 'img') {
  //   //   node.attribs.style = `max-width: ${WIDTH + 16}px; left: -16px; width: 100% !important`;
  //   // } else if (node.name == 'iframe') {
  //   //   node.attribs.style = `max-width: ${WIDTH}px; left: -20px`;
  //   //   node.attribs.height = 216;
  //   // }
  //   // if (node.name === 'a') {
  //   //   node.attribs.style = 'text-decoration: underline';
  //   // }
  // }

  _handleOnLinkPress = (evt, href, hrefatr) => {
    const { handleOnUserPress } = this.props;

    if (hrefatr.class === 'markdown-author-link') {
      handleOnUserPress(href);
    } else {
      Linking.canOpenURL(href).then((supported) => {
        if (supported) {
          Linking.openURL(href);
        } else {
          alert(`Field to open: ${href}`);
        }
      });
    }
  };

  render() {
    const { body } = this.props;

    return (
      <View>
        <HTML
          html={body}
          onLinkPress={(evt, href, hrefatr) => this._handleOnLinkPress(evt, href, hrefatr)}
          containerStyle={styles.container}
          textSelectable
          tagsStyles={styles}
          ignoredTags={['script']}
          debug={false}
          imagesInitialDimensions={{ width: WIDTH, height: 216 }}
          baseFontStyle={styles.text}
          imagesMaxWidth={WIDTH}
        />
      </View>
    );
  }
}

export default PostBody;
