import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useIntl } from 'react-intl';

// Components
import { useNavigation } from '@react-navigation/native';
import { SearchModal } from '../../searchModal';
import { IconButton } from '../../iconButton';
import { UserAvatar } from '../../userAvatar';

// Constants
import ROUTES from '../../../constants/routeNames';

// Styles
import styles from './headerStyles';
import Icon from '../../icon';

const HeaderView = ({
  displayName,
  handleOnPressBackButton,
  handleOnQRPress,
  handleOpenDrawer,
  handleOnBoostPress,
  isDarkTheme,
  isLoggedIn,
  isLoginDone,
  isReverse,
  reputation,
  username,
  hideUser,
  showQR,
  showBoost
}) => {
  const navigation = useNavigation();

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const intl = useIntl();
  let gradientColor;

  if (isReverse) {
    gradientColor = isDarkTheme ? ['#43638e', '#081c36'] : ['#357ce6', '#2d5aa0'];
  } else {
    gradientColor = isDarkTheme ? ['#081c36', '#43638e'] : ['#2d5aa0', '#357ce6'];
  }

  const _onPressSearchButton = () => {
    navigation.navigate(ROUTES.SCREENS.SEARCH_RESULT);
  };

  const _renderAvatar = () => (
    <TouchableOpacity style={styles.avatarWrapper} onPress={handleOpenDrawer} disabled={isReverse}>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={gradientColor}
        style={[
          styles.avatarButtonWrapper,
          isReverse ? styles.avatarButtonWrapperReverse : styles.avatarDefault,
        ]}
      >
        <UserAvatar
          noAction
          style={isReverse ? styles.reverseAvatar : styles.avatar}
          username={username}
        />
      </LinearGradient>
    </TouchableOpacity>
  );

  const _renderTitle = () => (
    <>
      {displayName || username ? (
        <View style={[styles.titleWrapper, isReverse && styles.titleWrapperReverse]}>
          {displayName && (
            <Text numberOfLines={1} style={styles.title}>
              {displayName}
            </Text>
          )}
          <Text style={styles.subTitle}>
            {`@${username}`}
            {reputation && ` (${reputation})`}
          </Text>
        </View>
      ) : (
        <View style={styles.titleWrapper}>
          {isLoginDone && !isLoggedIn && (
            <Text numberOfLines={2} style={styles.noAuthTitle}>
              {intl.formatMessage({
                id: 'header.title',
              })}
            </Text>
          )}
        </View>
      )}
    </>
  );

  const _renderActionButtons = () => (
    <>
      {isReverse ? (
        <View style={styles.reverseBackButtonWrapper}>
          <IconButton
            style={styles.backButton}
            iconStyle={styles.backIcon}
            name="md-arrow-back"
            onPress={handleOnPressBackButton}
          />
        </View>
      ) : (
        <View style={styles.backButtonWrapper}>

          {showQR && (
            <IconButton
              style={styles.viewIconContainer}
              iconStyle={styles.viewIcon}
              name="qr-code-sharp"
              iconType="IonIcons"
              onPress={handleOnQRPress}
            />
          )}
          <IconButton iconStyle={styles.backIcon} name="md-search" onPress={_onPressSearchButton} />
          
          {showBoost && (
            <IconButton
              style={styles.boostIconContainer}
              iconStyle={styles.boostPlusIcon}
              name="fire"
              iconType="FontAwesome5"
              onPress={handleOnBoostPress}
            />
          )}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
      {!hideUser && (
        <>
          <SearchModal
            placeholder={intl.formatMessage({
              id: 'header.search',
            })}
            isOpen={isSearchModalOpen}
            handleOnClose={() => setIsSearchModalOpen(false)}
          />

          {_renderAvatar()}
          {_renderTitle()}
        </>
      )}
      {_renderActionButtons()}
    </SafeAreaView>
  );
};

export default HeaderView;
