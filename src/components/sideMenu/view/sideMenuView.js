import React, { Component } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import {
  Thumbnail, List, ListItem, Container,
} from 'native-base';
import LinearGradient from 'react-native-linear-gradient';

// Components
import { Icon, IconButton } from '../..';

// Constants
import { default as MENU } from '../../../constants/sideMenuItems';

// Styles
import styles from './sideMenuStyles';

// Images
const DEFAULT_IMAGE = require('../../../assets/esteem.png');
const SIDE_MENU_BACKGROUND = require('../../../assets/side_menu_background.png');

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

  // Component Functions

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

  _getNameOfUser = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return currentAccount.name;
    if (Object.keys(currentAccount.about).length === 0) return currentAccount.name;
    if (Object.keys(currentAccount.about.profile).length !== 0) {
      return currentAccount.about.profile.name;
    }
    return currentAccount.name;
  };

  _getUserAvatar = () => {
    const { currentAccount } = this.props;
    if (Object.keys(currentAccount).length === 0) return DEFAULT_IMAGE;
    if (Object.keys(currentAccount.about).length === 0) return DEFAULT_IMAGE;
    if (Object.keys(currentAccount.about.profile).length !== 0) {
      return { uri: currentAccount.about.profile.profile_image };
    }
    return DEFAULT_IMAGE;
  };

  render() {
    const {
      navigateToRoute, currentAccount, isLoggedIn, switchAccount,
    } = this.props;
    const { menuItems, isAddAccountIconActive } = this.state;

    return (
      <Container style={styles.container}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#357ce6', '#2d5aa0']}
          style={styles.headerView}
        >
          <ImageBackground source={SIDE_MENU_BACKGROUND} style={{ width: '100%', height: '100%', flexDirection: 'row', }}>
            {isLoggedIn && (
              <View style={styles.headerContentView}>
                <Thumbnail style={styles.userAvatar} source={this._getUserAvatar()} />
                <View style={styles.userInfoView}>
                  <Text style={styles.username}>{this._getNameOfUser()}</Text>
                  <Text style={styles.usernick}>{`@${currentAccount.name}`}</Text>
                </View>
                <View style={styles.addAccountIconView}>
                  {/* TODO: delete android name */}
                  <IconButton
                    name={isAddAccountIconActive ? 'arrow-dropup' : 'add-circle-outline'}
                    androidName={
                      isAddAccountIconActive ? 'md-arrow-dropup' : 'ios-add-circle-outline'
                    }
                    color="white"
                    size={15}
                    handleOnPress={() => this._handleOnPressAddAccountIcon()}
                    style={styles.addAccountIcon}
                  />
                </View>
              </View>
            )}
          </ImageBackground>
        </LinearGradient>
        <View style={styles.contentView}>
          <List
            itemDivider={false}
            dataArray={menuItems}
            renderRow={item => (
              <ListItem
                noBorder
                style={styles.listItem}
                onPress={() => {
                  if (item.route) {
                    navigateToRoute(item.route);
                  } else {
                    switchAccount(item.name);
                  }
                }}
              >
                {item.icon && (
                  <Icon iconType="FontAwesome" style={styles.listItemIcon} name={item.icon} />
                )}
                {item.image && (
                  <Thumbnail small style={styles.otherUserAvatar} source={item.image} />
                )}
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
