import React, { Component, Fragment } from 'react';
import ActionSheet from 'react-native-actionsheet';
import { View, Text, TouchableOpacity } from 'react-native';
import { injectIntl } from 'react-intl';
import FastImage from 'react-native-fast-image';

// Utils
import { getTimeFromNow } from '../../../utils/time';

// Components
import { PostHeaderDescription } from '../../postElements';
import { IconButton } from '../../iconButton';

// Defaults
import DEFAULT_IMAGE from '../../../assets/no_image.png';

// Styles
import styles from './postListItemStyles';

class PostListItemView extends Component {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    name                - Description....
   */

  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      title,
      summary,
      mainTag,
      username,
      reputation,
      created,
      image,
      handleOnPressItem,
      handleOnRemoveItem,
      id,
      intl,
      isFormatedDate,
    } = this.props;

    return (
      <Fragment>
        <View style={styles.container}>
          <View style={styles.header}>
            <PostHeaderDescription
              // date={intl.formatRelative(created)}
              date={isFormatedDate ? created : getTimeFromNow(created, true)}
              name={username}
              reputation={reputation}
              size={32}
              tag={mainTag}
            />
            <IconButton
              backgroundColor="transparent"
              name="delete"
              iconType="MaterialIcons"
              size={20}
              onPress={() => this.ActionSheet.show()}
              style={[styles.rightItem]}
              color="#c1c5c7"
            />
          </View>
          <View style={styles.body}>
            <TouchableOpacity onPress={() => handleOnPressItem(id)}>
              <FastImage source={image} style={styles.image} defaultSource={DEFAULT_IMAGE} />
              <View style={[styles.postDescripton]}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.summary}>{summary}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <ActionSheet
          ref={o => (this.ActionSheet = o)}
          options={[
            intl.formatMessage({ id: 'alert.delete' }),
            intl.formatMessage({ id: 'alert.cancel' }),
          ]}
          title={intl.formatMessage({ id: 'alert.remove_alert' })}
          cancelButtonIndex={1}
          destructiveButtonIndex={0}
          onPress={index => {
            if (index === 0) handleOnRemoveItem(id);
          }}
        />
      </Fragment>
    );
  }
}

export default injectIntl(PostListItemView);
