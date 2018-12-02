import React, { Component } from 'react';
import { View, Text, ImageBackground } from 'react-native';
import { injectIntl } from 'react-intl';
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
const DEFAULT_IMAGE = require('../../../assets/avatar_default.png');
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

  render() {
    const {
      navigateToRoute, currentAccount, isLoggedIn, switchAccount, intl,
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
          <ImageBackground
            source={SIDE_MENU_BACKGROUND}
            style={{ width: '100%', height: '100%', flexDirection: 'row' }}
          >
            {isLoggedIn && (
              <View style={styles.headerContentView}>
                <Thumbnail
                  style={styles.userAvatar}
                  source={{ uri: currentAccount.about.profile.profile_image }}
                />
                <View style={styles.userInfoView}>
                  <Text style={styles.username}>{currentAccount.about.profile.name}</Text>
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
                <Text style={styles.listItemText}>
                  {intl.formatMessage({ id: `side_menu.${item.id}` })}
                </Text>
              </ListItem>
            )}
          />
        </View>
      </Container>
    );
  }
}

export default injectIntl(SideMenuView);
