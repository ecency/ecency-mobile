import React, { useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useIntl } from 'react-intl';

// Components
import { SearchModal } from '../../searchModal';
import { IconButton } from '../../iconButton';
import { UserAvatar } from '../../userAvatar';

// Styles
import styles from './headerStyles';

const HeaderView = ({
  displayName,
  handleOnPressBackButton,
  handleOpenDrawer,
  isDarkTheme,
  isLoggedIn,
  isLoginDone,
  isReverse,
  reputation,
  username,
}) => {
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const intl = useIntl();
  let gradientColor;

  if (isReverse) {
    gradientColor = isDarkTheme ? ['#43638e', '#081c36'] : ['#357ce6', '#2d5aa0'];
  } else {
    gradientColor = isDarkTheme ? ['#081c36', '#43638e'] : ['#2d5aa0', '#357ce6'];
  }

  return (
    <SafeAreaView style={[styles.container, isReverse && styles.containerReverse]}>
      <SearchModal
        placeholder={intl.formatMessage({
          id: 'header.search',
        })}
        isOpen={isSearchModalOpen}
        handleOnClose={() => setIsSearchModalOpen(false)}
      />
      <TouchableOpacity
        style={styles.avatarWrapper}
        onPress={handleOpenDrawer}
        disabled={isReverse}
      >
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
      {displayName || username ? (
        <View style={styles.titleWrapper}>
          {displayName && <Text style={styles.title}>{displayName}</Text>}
          <Text style={styles.subTitle}>
            {`@${username}`}
            {reputation && ` (${reputation})`}
          </Text>
        </View>
      ) : (
        <View style={styles.titleWrapper}>
          {isLoginDone && !isLoggedIn && (
            <Text style={styles.noAuthTitle}>
              {intl.formatMessage({
                id: 'header.title',
              })}
            </Text>
          )}
        </View>
      )}

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
          <IconButton
            iconStyle={styles.backIcon}
            name="md-search"
            onPress={() => setIsSearchModalOpen(true)}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

export default HeaderView;
