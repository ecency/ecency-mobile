import React, { Component } from 'react';
import { View, Dimensions, Linking } from 'react-native';
import { withNavigation } from 'react-navigation';
import HTML from 'react-native-html-renderer';

// Styles
import styles from './postBodyStyles';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
// Components

const WIDTH = Dimensions.get('window').width;

class PostBody extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _handleOnLinkPress = (evt, href, hrefatr) => {
    const { handleOnUserPress } = this.props;

    if (hrefatr.class === 'markdown-author-link') {
      !handleOnUserPress ? this._handleOnUserPress(href) : handleOnUserPress(href);
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

  _handleOnUserPress = (username) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.PROFILE,
      params: {
        username,
      },
      key: username,
    });
  };

  _alterNode = (node, isComment) => {
    if (isComment) {
      if (node.name === 'img') {
        node.attribs.style = `max-width: ${WIDTH + 16}px; maxHeight: 120px;`;
        console.log(node);
      } else if (node.name == 'iframe') {
        node.attribs.style = `max-width: ${WIDTH}px; left: -20px`;
        node.attribs.height = 216;
      }
    } else if (node.name === 'a') {
      node.attribs.style = 'text-decoration: underline';
    }
  };

  render() {
    const { body, isComment } = this.props;
    const _initialDimensions = isComment
      ? { width: WIDTH - 20, height: 50 }
      : { width: WIDTH, height: 216 };

    return (
      <View>
        <HTML
          html={body}
          onLinkPress={(evt, href, hrefatr) => this._handleOnLinkPress(evt, href, hrefatr)}
          containerStyle={isComment ? styles.commentContainer : styles.container}
          textSelectable
          tagsStyles={isComment ? { img: { height: 120 } } : styles}
          ignoredTags={['script']}
          debug={false}
          imagesInitialDimensions={_initialDimensions}
          baseFontStyle={styles.text}
          imagesMaxWidth={isComment ? WIDTH - 20 : WIDTH}
          alterNode={e => this._alterNode(e, isComment)}
        />
      </View>
    );
  }
}

export default withNavigation(PostBody);
