import React, { Component } from 'react';
import { Platform } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

class IconView extends Component {
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
        iconName = androidName || `md-${name.split('ios-')}`;
      }
      return iconName;
    }
    return null;
  };

  _getIcon = () => {
    const { iconType, children } = this.props;
    const name = this._getIconName();
    console.log('this.props :', this.props);

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
        return (
          <MaterialCommunityIcons name={name} {...this.props}>
            {children}
          </MaterialCommunityIcons>
        );
      default:
        return <Ionicons name {...this.props} />;
    }
  };

  render() {
    return this._getIcon();
  }
}

export default IconView;
