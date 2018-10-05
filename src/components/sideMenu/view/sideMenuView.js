import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Thumbnail, List, ListItem } from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';

// Constants
import { default as MENU } from '../../../constants/sideMenuItems';

// Styles
import styles from './sideMenuStyles';

const DEFAULT_IMAGE = require('../../../assets/esteem.png');

class SideMenuView extends Component {
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
  _navigateToRoute = (route) => {
    const { navigation } = this.props;
    navigation.navigate(route);
  };

  render() {
    const { isLoggedIn, userAvatar } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.headerView}>
          <View style={styles.headerContentView}>
            <Thumbnail style={styles.userAvatar} source={userAvatar || DEFAULT_IMAGE} />
            <View style={styles.userInfoView}>
              <Text style={styles.username}>Mustafa</Text>
              <Text style={styles.usernick}>@mistikk</Text>
            </View>
          </View>
        </View>
        <View style={styles.contentView}>
          <List
            itemDivider={false}
            dataArray={isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS}
            renderRow={item => (
              <ListItem
                noBorder
                style={styles.listItem}
                onPress={() => this._navigateToRoute(item.route)}
              >
                <Icon style={styles.listItemIcon} name={item.icon} />
                <Text style={styles.listItemText}>{item.name}</Text>
              </ListItem>
            )}
          />
        </View>
      </View>
    );
  }
}

export default SideMenuView;
