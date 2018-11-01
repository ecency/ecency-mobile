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
    this.state = {
      menuItems: [],
      isAddAccountIconActive: false,
    };
  }

  // Component Life Cycles

  componentWillMount() {
    const { isLoggedIn } = this.props;

    this.setState({
      menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
    });
  }

  _handleOnPressAddAccountIcon = () => {
    const { isAddAccountIconActive } = this.state;
    const { isLoggedIn, accounts } = this.props;
    if (!isAddAccountIconActive) {
      this.setState({ menuItems: accounts, isAddAccountIconActive: !isAddAccountIconActive });
    } else {
      this.setState({
        menuItems: isLoggedIn ? MENU.AUTH_MENU_ITEMS : MENU.NO_AUTH_MENU_ITEMS,
        isAddAccountIconActive: !isAddAccountIconActive,
      });
    }
  };

  // Component Functions

  render() {
    const { userAvatar, navigateToRoute, currentAccount } = this.props;
    const { menuItems, isAddAccountIconActive } = this.state;
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
                name={isAddAccountIconActive ? 'arrow-dropup' : 'add-circle-outline'}
                androidName={isAddAccountIconActive ? 'md-arrow-dropup' : 'ios-add-circle-outline'}
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
