import React, { PureComponent, Fragment } from 'react';
import { Dimensions, Linking, Alert } from 'react-native';
import { withNavigation } from 'react-navigation';
import { injectIntl } from 'react-intl';

import HTML from 'react-native-html-renderer';
import { getParentsTagsRecursively } from 'react-native-html-renderer/src/HTMLUtils';

// Utils
import { validateUsername } from  '../../../../utils/user';

// Styles
import styles from './postBodyStyles';

// Constants
import { default as ROUTES } from '../../../../constants/routeNames';
// Components

const WIDTH = Dimensions.get('window').width;
const CUSTOM_RENDERERS = {
  // example
  // center: () => <Text style={{ backgroundColor: 'blue', textAlign: 'center'}}>ugur</Text>,
};
const DEFAULT_PROPS = {
  renderers: CUSTOM_RENDERERS,
  debug: true,
};

class PostBody extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  _handleOnLinkPress = (evt, href, hrefatr) => {
    const { handleOnUserPress, handleOnPostPress } = this.props;
    console.log('href :', href);
    console.log('hrefatr :', hrefatr);

    if (hrefatr.class === 'markdown-author-link') {
      if (!handleOnUserPress) {
        this._handleOnUserPress(hrefatr.data_author);
      } else {
        handleOnUserPress(hrefatr.data_author);
      }
    } else if (hrefatr.class === 'markdown-post-link') {
      if (!handleOnPostPress) {
        this._handleOnPostPress(href, hrefatr.data_author);
      } else {
        handleOnPostPress(href);
      }
    } else {
      this._handleBrowserLink(href);
    }
  };

  _handleBrowserLink = async (url) => {
    if (!url) return;

    let author;
    let permlink;
    const { intl } = this.props;

    if (
      url.indexOf('esteem') > -1
      || url.indexOf('steemit') > -1
      || url.indexOf('busy') > -1
      || (url.indexOf('steempeak') > -1 && url.indexOf('files') < 0)
    ) {
      url = url.substring(url.indexOf('@'), url.length);
      const routeParams = url && url.indexOf('/') > -1 ? url.split('/') : [url];

      [, permlink] = routeParams;
      author = routeParams[0].indexOf('@') > -1 ? routeParams[0].replace('@', '') : routeParams[0];
    }

    if (author && permlink) {
      this._handleOnPostPress(permlink, author);
    } else if (author) {
      this._handleOnUserPress(author);
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
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

    if (username && validateUsername(username)) {
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
        node.attribs.style = `max-width: ${WIDTH - 50}px; height: 100px; width: ${WIDTH
          - 50}px; text-align: center;`;
      }
      //  else if (node.name === 'iframe') {
      //   node.attribs.style = `max-width: ${WIDTH}px; left: -30px`;
      //   node.attribs.height = 216;
      // }
    } else if (node.name === 'a') {
      console.log('node :', node);
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

  _alterData = (node) => {
    if (node.type === 'text' && node.data.includes('markdown-author-link') && node.parent && getParentsTagsRecursively(node.parent).includes('code')) {
      return node.data.replace(/<[^>]*>/g, '');
    }
  }

  render() {
    const { body, isComment } = this.props;
    const _initialDimensions = isComment
      ? { width: WIDTH - 50, height: 80 }
      : { width: WIDTH, height: 216 };

    return (
      <Fragment>
        <HTML
          {...DEFAULT_PROPS}
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
        />
      </Fragment>
    );
  }
}

export default injectIntl(withNavigation(PostBody));
