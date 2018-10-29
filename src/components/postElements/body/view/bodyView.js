import React, { Component } from 'react';
import {
  View, Text, TouchableOpacity, Dimensions,
} from 'react-native';
import HTML from 'react-native-html-renderer';
// Components

// Styles
import styles from './postBodyStyles';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/esteem.png');

class BodyView extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions
  alterNode(node) {
    if (node.name == 'img') {
      node.attribs.style = `max-width: ${Dimensions.get('window').width
        + 10}px; left: -10px; width: 100% !important`;
    } else if (node.name == 'iframe') {
      node.attribs.style = `max-width: ${Dimensions.get('window').width}px; left: -10px`;
      node.attribs.height = 200;
    }
  }

  render() {
    const { body } = this.props;

    return (
      <View style={styles.container}>
        <HTML
          html={body}
          onLinkPress={(evt, href, hrefatr) => this.onLinkPress(evt, href, hrefatr)}
          containerStyle={{ padding: 10 }}
          textSelectable
          tagsStyles={styles}
          ignoredTags={['script']}
          debug={false}
          alterNode={(node) => {
            this.alterNode(node);
          }}
          imagesMaxWidth={Dimensions.get('window').width}
        />
      </View>
    );
  }
}

export default BodyView;
