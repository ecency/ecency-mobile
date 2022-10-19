import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useIntl } from 'react-intl';

import styles from './communitiesListItemStyles';

import { Tag } from '../../../../basicUIElements';

const CommunitiesListItem = ({
  index,
  handleOnPress,
  handleOnLongPress,
  title,
  about,
  admins,
  id,
  authors,
  posts,
  subscribers,
  isNsfw,
  name,
  handleSubscribeButtonPress,
  isSubscribed,
  isLoggedIn,
  loading,
  screen,
}) => {
  const intl = useIntl();

  const _handleSubscribeButtonPress = () => {
    handleSubscribeButtonPress({ isSubscribed, communityId: name, communityTitle: title }, screen);
  };

  return (
    <TouchableOpacity
      onLongPress={() => handleOnLongPress && handleOnLongPress()}
      onPress={() => handleOnPress && handleOnPress(name)}
    >
      <View style={[styles.itemWrapper, index % 2 !== 0 && styles.itemWrapperGray]}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {isLoggedIn &&
              (loading ? (
                <View style={styles.indicatorView}>
                  <ActivityIndicator />
                </View>
              ) : (
                <Tag
                  style={styles.subscribeButton}
                  textStyle={isSubscribed && styles.subscribeButtonText}
                  value={
                    !isSubscribed
                      ? intl.formatMessage({
                          id: 'search_result.communities.subscribe',
                        })
                      : intl.formatMessage({
                          id: 'search_result.communities.unsubscribe',
                        })
                  }
                  isPin={!isSubscribed}
                  isFilter
                  onPress={_handleSubscribeButtonPress}
                />
              ))}
          </View>
          {!!about && <Text style={styles.about}>{about}</Text>}
          <View style={styles.separator} />
          <Text style={styles.stats}>
            {`${subscribers.toString()} ${intl.formatMessage({
              id: 'search_result.communities.subscribers',
            })} • ${authors.toString()} ${intl.formatMessage({
              id: 'search_result.communities.posters',
            })} • ${posts} ${intl.formatMessage({
              id: 'search_result.communities.posts',
            })}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CommunitiesListItem;
