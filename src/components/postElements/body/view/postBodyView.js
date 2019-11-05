import React, { Fragment } from 'react';
import { Dimensions, Linking, Alert, TouchableOpacity, Text } from 'react-native';
import { withNavigation } from 'react-navigation';
import { useIntl, injectIntl } from 'react-intl';
import HTML from 'react-native-render-html';
import { getParentsTagsRecursively } from 'react-native-render-html/src/HTMLUtils';
import AutoHeightWebView from 'react-native-autoheight-webview';
import EStyleSheet from 'react-native-extended-stylesheet';

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
  const handleWebViewNavigationStateChange = newNavState => {
    console.log('newNavState :', newNavState);
    if (newNavState.navigationType === 'click') {
      return false;
    }
    return newNavState;
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
  const test = body.replace(/<a/g, '<a target="_blank"');
  // console.log('test :', test);
  const runFirst = `
      document.addEventListener('click', function(event) {
        let el = event.target;
        // A element can be wrapped with inline element. Look parent elements.
        // alert(el.tagName.toString())
        while (el.tagName !== 'A') {
          if (!el.parentNode) {
            break;
          }
          el = el.parentNode;
        }
        window.ReactNativeWebView.postMessage('"Hello!"')
        window.ReactNativeWebView.postMessage('1')
        if (!el || el.tagName !== 'A') {

          // window.ReactNativeWebView.postMessage(!el)
          // window.ReactNativeWebView.postMessage(el.tagName)
          return;
        }
        window.ReactNativeWebView.postMessage('2')
        if (el.getAttribute('target') === '_external') {
          const href = el.getAttribute('href');
          shell.openExternal(href);
          event.preventDefault();
          return true;
        }
        window.ReactNativeWebView.postMessage('3')
        if (el.classList.contains('markdown-external-link')) {
          const href = el.getAttribute('data-href');
          shell.openExternal(href);
          event.preventDefault();
          return true;
        }
        window.ReactNativeWebView.postMessage('4')
        const author = el.getAttribute('data-author').toString();
        window.ReactNativeWebView.postMessage(JSON.stringify(author))
      })
      true; // note: this is required, or you'll sometimes get silent failures
    `;
  // console.log('body :', body);
  // EStyleSheet.value('$contentWidth')
  const customStyle = `
  * {
    color: ${EStyleSheet.value('$primaryBlack')};
    font-family: Roboto, sans-serif;
  }
  body {
    color: ${EStyleSheet.value('$primaryBlack')};
  }
  a {
    color: ${EStyleSheet.value('$primaryBlue')};
    cursor: pointer;
  }
  img {
    max-width: 100%;
    margin-bottom: 30px;
    align-self: 'center';
  }
  center {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }
  th {
    flex: 1;
    justify-content: 'center';
    font-weight: 'bold';
    color: ${EStyleSheet.value('$primaryBlack')};
    font-size: 14;
    padding: 5;
  }
  tr {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    flex-direction: 'row';
  }
  td: {
    border-width: 0.5;
    border-color: ${EStyleSheet.value('$tableBorderColor')};
    flex: 1;
    padding: 10;
    background-color: ${EStyleSheet.value('$tableTrColor')};
  }
  blockquote: {
    border-left-width: 5;
    border-color: ${EStyleSheet.value('$darkIconColor')};
    padding-left: 5;
  }
  code: {
    background-color: ${EStyleSheet.value('$darkIconColor')};
    font-family: ${EStyleSheet.value('$editorFont')};
  }
  center: {
    text-align: 'center';
    align-items: 'center';
    justify-content: 'center';
  }`;
  console.log('EStyleSheet.value', EStyleSheet.value('$primaryBlack'));
  console.log('customStyle :', customStyle);
  return (
    <Fragment>
      <AutoHeightWebView
        style={{ maxWidth: Dimensions.get('window').width - 15, marginTop: 35 }}
        source={{
          html: test,
        }}
        // javaScriptEnabled={false}
        customStyle={customStyle}
        onMessage={m => console.log('message :', m.nativeEvent.data)}
        // onShouldStartLoadWithRequest={handleWebViewNavigationStateChange}
        customScript={runFirst}
      />
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
    </Fragment>
  );
};

const areEqual = (prevProps, nextProps) => {
  // console.log('prevProps, nextProps :', prevProps, nextProps);
  if (prevProps.body !== nextProps.body) {
    return true;
  }
  return false;
};

export default React.memo(injectIntl(withNavigation(PostBody)), areEqual);
