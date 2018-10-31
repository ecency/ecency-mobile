import React, { Component } from 'react';
import { View, Text } from 'react-native';
import {
  Thumbnail, List, ListItem, Container,
} from 'native-base';
import Icon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';

import { getUserData } from '../../../realm/realm';

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
    this.state = {
      menuItems: [],
      accounts: [],
      addIconName: 'ios-add-circle-outline',
    };
  }

  // Component Life Cycles

  componentWillMount() {
    const { isLoggedIn } = this.props;
    const accounts = [];

    getUserData().then((res) => {
      res.forEach((element) => {
        accounts.push({ name: element.username, image: 'test' });
      });
      this.setState({
        menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
        accounts,
      });
    });
  }

  _handleOnPressAddAccountIcon = () => {
    const { accounts } = this.state;
    this.setState({ menuItems: accounts, addIconName:'md-arrow-dropup' });
  };

  // Component Functions

  render() {
    const { userAvatar, navigateToRoute } = this.props;
    const { menuItems, addIconName } = this.state;
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
              <IconButton
                name="add-circle-outline"
                androidName={addIconName}
                color="white"
                size={15}
                handleOnPress={() => this._handleOnPressAddAccountIcon()}
              />
            </View>
          </View>
        </LinearGradient>
        <View style={styles.contentView}>
          <List
            itemDivider={false}
            dataArray={menuItems}
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
