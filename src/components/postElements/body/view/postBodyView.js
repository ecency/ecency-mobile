import React from 'react';
import { Dimensions, Linking, Alert, TouchableOpacity, Text } from 'react-native';
import { withNavigation } from 'react-navigation';
import { useIntl, injectIntl } from 'react-intl';
import HTML from 'react-native-render-html';
import { getParentsTagsRecursively } from 'react-native-render-html/src/HTMLUtils';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';

// Styles
import styles from './postBodyStyles';

const WIDTH = Dimensions.get('window').width;

const PostBody = ({
  navigation,
  body,
  isComment,
  textSelectable = true,
  handleOnUserPress,
  handleOnPostPress,
}) => {
  const intl = useIntl();

  const _handleOnLinkPress = (href, hrefAtr) => {
    if (hrefAtr.class === 'markdown-author-link') {
      if (!handleOnUserPress) {
        _handleOnUserPress(hrefAtr['data-author']);
      } else {
        handleOnUserPress(hrefAtr['data-author']);
      }
    } else if (hrefAtr.class === 'markdown-post-link') {
      if (!handleOnPostPress) {
        _handleOnPostPress(hrefAtr['data-permlink'], hrefAtr['data-author']);
      } else {
        handleOnPostPress(hrefAtr['data-permlink']);
      }
    } else {
      _handleBrowserLink(href);
    }
  };

  const _handleBrowserLink = async url => {
    if (!url) {
      return;
    }

    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(intl.formatMessage({ id: 'alert.failed_to_open' }));
      }
    });
  };

  const _handleOnPostPress = (permlink, author) => {
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

  const _handleOnUserPress = username => {
    if (username) {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
        },
        key: username,
      });
    } else {
      Alert.alert('Opss!', 'Wrong link.');
    }
  };

  const _hasParentTag = (node, name) => {
    if (!node.parent) {
      return false;
    }

    if (node.name === name) {
      return true;
    }

    return _hasParentTag(node.parent, name);
  };

  const _alterNode = (node, isComment) => {
    if (isComment) {
      if (node.name === 'img') {
        node.attribs.style = `max-width: ${WIDTH - 50}px; height: 100px; width: ${WIDTH -
          50}px; text-align: center;`;
      }
    } else if (node.name === 'a') {
      node.attribs.style = 'text-decoration: underline';
    }

    if (node.name === 'img') {
      node.attribs.style = 'text-align: center;';
      if (_hasParentTag(node, 'td')) {
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

  const _alterData = node => {
    if (
      node.type === 'text' &&
      node.data.includes('markdown-author-link') &&
      node.parent &&
      getParentsTagsRecursively(node.parent).includes('code')
    ) {
      return node.data.replace(/<[^>]*>/g, '');
    }
  };

  const _initialDimensions = isComment
    ? { width: WIDTH - 50, height: 80 }
    : { width: WIDTH, height: 216 };

  const _customRenderer = {
    a: (htmlAttribs, children, convertedCSSStyles, passProps) => {
      if (passProps.parentWrapper === 'Text') {
        return (
          <Text
            key={passProps.key}
            {...htmlAttribs}
            onPress={() => _handleOnLinkPress(htmlAttribs['data-href'], htmlAttribs)}
          >
            {children}
          </Text>
        );
      }
      return (
        <TouchableOpacity
          key={passProps.key}
          {...htmlAttribs}
          onPress={() => _handleOnLinkPress(htmlAttribs['data-href'], htmlAttribs)}
        >
          {children}
        </TouchableOpacity>
      );
    },
    br: (htmlAttribs, children, passProps) => {
      return <Text {...passProps}>{'\n'}</Text>;
    },
  };

  return (
    <HTML
      html={body}
      onLinkPress={(evt, href, hrefAtr) => _handleOnLinkPress(evt, href, hrefAtr)}
      containerStyle={isComment ? styles.commentContainer : styles.container}
      textSelectable={textSelectable}
      tagsStyles={isComment ? { img: { height: 120 } } : styles}
      ignoredTags={['script']}
      debug={false}
      staticContentMaxWidth={WIDTH - 33}
      imagesInitialDimensions={_initialDimensions}
      baseFontStyle={styles.text}
      imagesMaxWidth={isComment ? WIDTH - 50 : WIDTH}
      alterNode={e => _alterNode(e, isComment)}
      alterData={e => _alterData(e)}
      renderers={_customRenderer}
    />
  );
};

export default injectIntl(withNavigation(PostBody));
