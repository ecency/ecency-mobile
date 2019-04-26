import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { withNavigation } from 'react-navigation';

// Components
import { Tag, TextWithIcon } from '../../../basicUIElements';
import { Icon } from '../../../icon';
import { UserAvatar } from '../../../userAvatar';
// Styles
import styles from './postHeaderDescriptionStyles';

import { default as ROUTES } from '../../../../constants/routeNames';

// Constants
const DEFAULT_IMAGE = require('../../../../assets/esteem.png');

class PostHeaderDescription extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      reblogedBy: props.reblogedBy || null,
    };
  }

  // Component Life Cycles
  componentWillReceiveProps(nextProps) {
    const { reblogedBy } = this.props;

    if (reblogedBy !== nextProps.reblogedBy && !nextProps.reblogedBy) {
      this.setState({ reblogedBy });
    }
  }

  // Component Functions
  _handleOnUserPress = (username) => {
    const { navigation, profileOnPress, reputation } = this.props;

    if (profileOnPress) {
      profileOnPress(username);
    } else {
      navigation.navigate({
        routeName: ROUTES.SCREENS.PROFILE,
        params: {
          username,
          reputation,
        },
        key: username,
      });
    }
  };

  render() {
    const {
      date,
      isHideImage,
      name,
      reputation,
      size,
      tag,
      tagOnPress,
      isShowOwnerIndicator,
    } = this.props;
    const { reblogedBy } = this.state;

    const _reputationText = `(${reputation})`;

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.avatarNameWrapper}
          onPress={() => this._handleOnUserPress(name)}
        >
          {!isHideImage && (
            <UserAvatar
              style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
              disableSize
              username={name}
              defaultSource={DEFAULT_IMAGE}
              noAction
            />
          )}
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.reputation}>{_reputationText}</Text>
        </TouchableOpacity>
        {!!tag && (
          <TouchableOpacity onPress={() => tagOnPress && tagOnPress()}>
            <Tag isPostCardTag isPin value={tag} />
          </TouchableOpacity>
        )}
        <Text style={styles.date}>{date}</Text>
        {isShowOwnerIndicator && (
          <Icon style={styles.ownerIndicator} name="stars" iconType="MaterialIcons" />
        )}
        {!!reblogedBy && (
          // <TextWithIcon text={reblogedBy} iconType="MaterialIcons" iconName="repeat" />
          <Icon style={styles.reblogedIcon} name="repeat" iconType="MaterialIcons" />
        )}
      </View>
    );
  }
}

export default withNavigation(PostHeaderDescription);
