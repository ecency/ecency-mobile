import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
  Thumbnail, List, ListItem, Container,
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

// Components
import { IconButton } from '../..';

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

  render() {
    const { isLoggedIn, userAvatar, navigateToRoute } = this.props;
    // TODO: Change dummy data
    return (
      <Container style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#357ce6', '#2d5aa0']}
          style={styles.headerView}
        >
          <View style={styles.headerContentView}>
            <Thumbnail style={styles.userAvatar} source={userAvatar || DEFAULT_IMAGE} />
            <View style={styles.userInfoView}>
              <Text style={styles.username}>Mustafa</Text>
              <Text style={styles.usernick}>@mistikk</Text>
            </View>
            <View style={styles.addAccountIconView}>
              {/* TODO: delete android name */}
              <IconButton name="add-circle-outline" androidName="ios-add-circle-outline" color="white" size={15} handleOnPress={() => console.log('test')} />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.contentView}>
          <List
            itemDivider={false}
            dataArray={isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS}
            renderRow={item => (
              <ListItem
                noBorder
                style={styles.listItem}
                onPress={() => navigateToRoute(item.route)}
              >
                <Icon style={styles.listItemIcon} name={item.icon} />
                <Text style={styles.listItemText}>{item.name}</Text>
              </ListItem>
            )}
          />
        </View>
      </Container>
    );
  }
}

export default SideMenuView;
