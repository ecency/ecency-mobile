import React, { PureComponent, Fragment } from 'react';
import { Dimensions, Linking, Alert, TouchableOpacity, Text } from 'react-native';
import { withNavigation } from 'react-navigation';
import { injectIntl } from 'react-intl';
import FastImage from 'react-native-fast-image';
import { proxifyImageSrc } from '@esteemapp/esteem-render-helpers';

import HTML from 'react-native-render-html';
import { getParentsTagsRecursively } from 'react-native-render-html/src/HTMLUtils';

// Styles
import styles from './postBodyStyles';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
import DEFAULT_IMAGE from '../../../../assets/no_image.png';
// Components

const WIDTH = Dimensions.get('window').width;

class PostBody extends PureComponent {
  // Component Life Cycles

  // Component Functions

  _handleOnLinkPress = (href, hrefatr) => {
    const { handleOnUserPress, handleOnPostPress } = this.props;

    if (hrefatr.class === 'markdown-author-link') {
      if (!handleOnUserPress) {
        this._handleOnUserPress(hrefatr['data-author']);
      } else {
        handleOnUserPress(hrefatr['data-author']);
      }
    } else if (hrefatr.class === 'markdown-post-link') {
      if (!handleOnPostPress) {
        this._handleOnPostPress(hrefatr['data-permlink'], hrefatr['data-author']);
      } else {
        handleOnPostPress(hrefatr['data-permlink']);
      }
    } else {
      this._handleBrowserLink(href);
    }
  };

  _handleBrowserLink = async url => {
    if (!url) return;
    const { intl } = this.props;

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(intl.formatMessage({ id: 'alert.failed_to_open' }));
      }
    });
  };

  _handleOnPostPress = (permlink, author) => {
    const { navigation } = this.props;

    if (permlink) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.POST,
        params: {
          author,
          permlink,
        },
        key: permlink,
      });
    }
  };

  _handleOnUserPress = username => {
    const { navigation } = this.props;

    if (username) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      Alert.alert('Opps!', 'Wrong link :(');
    }
  };

  _hasParentTag = (node, name) => {
    if (!node.parent) return false;
    if (node.name === name) return true;
    return this._hasParentTag(node.parent, name);
  };

  _alterNode = (node, isComment) => {
    if (isComment) {
      if (node.name === 'img') {
        node.attribs.style = `max-width: ${WIDTH - 50}px; height: 100px; width: ${WIDTH -
          50}px; text-align: center;`;
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
      if (this._hasParentTag(node, 'td')) {
        node.attribs.style = `max-width: ${WIDTH / 2 - 20}px; `;
      }
    }

    if (node.name === 'div' && node.attribs && node.attribs.class) {
      const _className = node.attribs.class;

      if (_className === 'pull-right') {
        node.attribs.style = 'text-align: right; align-self: flex-end;';
      }

      if (_className === 'pull-left') {
        node.attribs.style = 'text-align: left; align-self: flex-start;';
      }

      if (_className === 'text-justify') {
        node.attribs.style = 'text-align: justify; text-justify: inter-word; letter-spacing: 0px;';
      }

      if (_className === 'phishy') {
        node.attribs.style = 'color: red';
      }
    }
  };

  _alterData = node => {
    if (
      node.type === 'text' &&
      node.data.includes('markdown-author-link') &&
      node.parent &&
      getParentsTagsRecursively(node.parent).includes('code')
    ) {
      return node.data.replace(/<[^>]*>/g, '');
    }
  };

  render() {
    const { body, isComment } = this.props;
    const _initialDimensions = isComment
      ? { width: WIDTH - 50, height: 80 }
      : { width: WIDTH, height: 216 };

    const _customRenderer = {
      img: (htmlAttribs, children, convertedCSSStyles, passProps) => (
        <FastImage
          key={passProps.key}
          defaultSource={DEFAULT_IMAGE}
          source={{
            uri: proxifyImageSrc(htmlAttribs.src, _initialDimensions.width, 0),
            priority: FastImage.priority.normal,
          }}
          style={isComment ? styles.commentImage : styles.postImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      ),
      a: (htmlAttribs, children, convertedCSSStyles, passProps) => {
        if (passProps.parentWrapper === 'Text') {
          return (
            <Text
              key={passProps.key}
              {...htmlAttribs}
              onPress={() => this._handleOnLinkPress(htmlAttribs['data-href'], htmlAttribs)}
            >
              {children}
            </Text>
          );
        }
        return (
          <TouchableOpacity
            key={passProps.key}
            {...htmlAttribs}
            onPress={() => this._handleOnLinkPress(htmlAttribs['data-href'], htmlAttribs)}
          >
            {children}
          </TouchableOpacity>
        );
      },
    };

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
          alterData={e => this._alterData(e)}
          renderers={_customRenderer}
        />
      </Fragment>
    );
  }
}

export default injectIntl(withNavigation(PostBody));
