import React, { PureComponent, Fragment } from 'react';
import { Platform, View, Text, StyleProp, TextStyle, ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import styles from './iconStyles';

interface IconProps {
  iconType?: string;
  name?: string;
  // Android sometimes needs a different glyph name for the same icon
  androidName?: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  badgeCount?: number | string;
  badgeStyle?: StyleProp<ViewStyle>;
  badgeTextStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  // remaining props spread into the underlying vector-icon set
  [key: string]: any;
}

class IconView extends PureComponent<IconProps> {
  _getIconName = () => {
    const { name, androidName } = this.props;

    if (name) {
      const isIos = Platform.OS === 'ios';
      let iconName;

      if (!isIos) {
        iconName = androidName || name;
      }
      return iconName;
    }
    return null;
  };

  _getIcon = () => {
    const { iconType, children, name } = this.props;
    let _name: any = name;

    if (iconType !== 'MaterialIcons') {
      _name = this._getIconName();
    }

    switch (iconType) {
      case 'Feather':
        return <Feather {...(this.props as any)} />;
      case 'FontAwesome':
        return <FontAwesome {...(this.props as any)} />;
      case 'FontAwesome5':
        return <FontAwesome5 {...(this.props as any)} />;
      case 'SimpleLineIcons':
        return <SimpleLineIcons {...(this.props as any)}>{children}</SimpleLineIcons>;
      case 'AntDesign':
        return <AntDesign {...(this.props as any)}>{children}</AntDesign>;
      case 'MaterialIcons':
        return <MaterialIcons {...(this.props as any)}>{children}</MaterialIcons>;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...(this.props as any)}>{children}</MaterialCommunityIcons>;
      default:
        return <Ionicons name={_name} {...(this.props as any)} />;
    }
  };

  _getIconWithBadge = (badgeCount: any) => {
    const { badgeStyle, badgeTextStyle } = this.props;

    return (
      <Fragment>
        <View style={[badgeStyle || styles.badgeWrapper]}>
          <Text style={[badgeTextStyle || styles.badge]}>{badgeCount}</Text>
        </View>
        {this._getIcon()}
      </Fragment>
    );
  };

  render() {
    const { badgeCount } = this.props;
    let _badgeCount = badgeCount;

    if (_badgeCount && (_badgeCount as any) >= 99) {
      _badgeCount = '99+';
    }

    if (!badgeCount) {
      return this._getIcon();
    }

    return this._getIconWithBadge(_badgeCount);
  }
}

export default IconView;
