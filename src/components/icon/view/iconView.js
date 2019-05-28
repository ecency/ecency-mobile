import React, { PureComponent, Fragment } from 'react';

import { Platform, View, Text } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import styles from './iconStyles';

class IconView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // for ios its turn ios-eye-off-outline
  // for android its turn to md-off-outline
  _getIconName = () => {
    const { name, androidName } = this.props;

    if (name) {
      const isIos = Platform.OS === 'ios';
      let iconName;

      if (!isIos) {
        iconName = androidName || (name && `md-${name.split('ios-')}`);
      }
      return iconName;
    }
    return null;
  };

  _getIcon = () => {
    const { iconType, children, name } = this.props;
    let _name = name;

    if (iconType !== 'MaterialIcons') {
      _name = this._getIconName();
    }

    switch (iconType) {
      case 'Feather':
        return <Feather {...this.props} />;
      case 'FontAwesome':
        return <FontAwesome {...this.props} />;
      case 'SimpleLineIcons':
        return <SimpleLineIcons {...this.props}>{children}</SimpleLineIcons>;
      case 'AntDesign':
        return <AntDesign {...this.props}>{children}</AntDesign>;
      case 'MaterialIcons':
        return <MaterialIcons {...this.props}>{children}</MaterialIcons>;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons {...this.props}>{children}</MaterialCommunityIcons>;
      default:
        return <Ionicons name={_name} {...this.props} />;
    }
  };

  _getIconWithBadge = badgeCount => {
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

    if (_badgeCount && _badgeCount >= 99) {
      _badgeCount = '99+';
    }

    if (!badgeCount) return this._getIcon();

    return this._getIconWithBadge(_badgeCount);
  }
}

export default IconView;
