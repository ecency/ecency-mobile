import React, { PureComponent, Fragment } from 'react';
import { Dimensions, Linking, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import { injectIntl } from 'react-intl';

import HTML from 'react-native-html-renderer';

// Styles
import styles from './postBodyStyles';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
// Components

const WIDTH = Dimensions.get('window').width;

class PostBody extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _handleOnLinkPress = (evt, href, hrefatr) => {
    const { handleOnUserPress, handleOnPostPress, intl } = this.props;

    if (hrefatr.class === 'markdown-author-link') {
      if (!handleOnUserPress) {
        this._handleOnUserPress(href);
      } else {
        handleOnUserPress(href);
      }
    } else if (hrefatr.class === 'markdown-post-link') {
      if (!handleOnPostPress) {
        this._handleOnPostPress(href, hrefatr.data_author);
      } else {
        handleOnPostPress(href);
      }
    } else {
      Linking.canOpenURL(href).then((supported) => {
        if (supported) {
          Linking.openURL(href);
        } else {
          Alert.alert(intl.formatMessage({ id: 'alert.failed_to_open' }));
        }
      });
    }
  };

  _handleOnPostPress = (permlink, author) => {
    const { navigation } = this.props;

    navigation.navigate({
      routeName: ROUTES.SCREENS.POST,
      params: {
        author,
        permlink,
      },
      key: permlink,
    });
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
        node.attribs.style = `max-width: ${WIDTH - 50}px; height: 100px; width: ${WIDTH
          - 50}px; text-align: center;`;
      }
      //  else if (node.name === 'iframe') {
      //   node.attribs.style = `max-width: ${WIDTH}px; left: -30px`;
      //   node.attribs.height = 216;
      // }
    } else if (node.name === 'a') {
      node.attribs.style = 'text-decoration: underline';
    }

    if (node.name === 'img') {
      node.attribs.style = 'text-align: center;';
    }
  };

  render() {
    const { body, isComment } = this.props;
    const _initialDimensions = isComment
      ? { width: WIDTH - 50, height: 80 }
      : { width: WIDTH, height: 216 };
    return (
      <Fragment>
        <HTML
          html={body}
          onLinkPress={(evt, href, hrefatr) => this._handleOnLinkPress(evt, href, hrefatr)}
          containerStyle={isComment ? styles.commentContainer : styles.container}
          textSelectable
          tagsStyles={isComment ? { img: { height: 120 } } : styles}
          ignoredTags={['script']}
          debug={false}
          staticContentMaxWidth={WIDTH - 33}
          imagesInitialDimensions={_initialDimensions}
          baseFontStyle={styles.text}
          imagesMaxWidth={isComment ? WIDTH - 50 : WIDTH}
          alterNode={e => this._alterNode(e, isComment)}
        />
      </Fragment>
    );
  }
}

export default injectIntl(withNavigation(PostBody));
