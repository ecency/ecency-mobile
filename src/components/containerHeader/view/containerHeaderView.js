import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Constants

// Components

// Styles
import styles from './containerHeaderStyles';

class ContainerHeaderView extends PureComponent {
  /* Props
   * ------------------------------------------------
   *   @prop { type }    title            - Renderable title for header.
   *
   */
  constructor(props) {
    super(props);
    this.state = {};
  }

  // Component Life Cycles

  // Component Functions

  render() {
    const {
      color,
      defaultTitle,
      fontSize,
      hasSeperator,
      iconName,
      isBoldTitle,
      title,
      isCenter,
    } = this.props;

    return (
      <View style={[styles.wrapper, hasSeperator && styles.hasTopBorder]}>
        <Text
          numberOfLines={2}
          ellipsizeMode="tail"
          style={[
            styles.title,
            isCenter && styles.centerTitle,
            isBoldTitle && { fontWeight: 'bold' },
            color && { color },
            fontSize && { fontSize },
          ]}
        >
          {title || defaultTitle}
        </Text>
        {iconName && <Ionicons style={styles.icon} name={iconName} />}
      </View>
    );
  }
}

export default ContainerHeaderView;
