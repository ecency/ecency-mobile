import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import get from 'lodash/get';
import {
  useChannelsQuery,
  useCommunityChannelQuery,
  useDirectContactsQuery,
  useKeysQuery,
} from '@ecency/ns-query';
import { DropdownButton, Header, TextInput } from '../../../components';

import styles from './channelsScreen.style';
import globalStyles from '../../../globalStyles';
import { LoggedInContainer } from '../../../containers';
import { setFeedPosts, setInitPosts } from '../../../redux/actions/postsAction';
import { logout } from '../../../redux/actions/uiAction';
import { useAppDispatch } from '../../../hooks';
import { ChatChannelsList } from '../components/chatChannelsList';
import ChatWelcome from '../components/ChatWelcome';

const ChannelsScreen = ({ intl }) => {
  const dispatch = useAppDispatch();

  // const { data: directContacts } = useDirectContactsQuery();
  // const { data: channels } = useChannelsQuery();
  const { publicKey, privateKey } = useKeysQuery();

  // console.log({ directContacts });
  // console.log({ channels });

  const [search, setSearch] = useState('');

  const logoutHandler = useCallback(() => {
    dispatch(setFeedPosts([]));
    dispatch(setInitPosts([]));
    dispatch(logout());
  }, []);

  const dropdownOption = [
    {
      title: intl.formatMessage({ id: 'chat.manage-chat-key' }),
      onPress: (title) => console.log({ title }),
    },
    {
      title: intl.formatMessage({ id: 'chat.logout' }),
      onPress: logoutHandler,
    },
  ];

  const onPressDropdownHandler = useCallback((index) => {
    const find = dropdownOption.find((value, i) => i === index);

    if (find) {
      find.onPress(find.title);
    }
  }, []);

  const isReady = useMemo(() => !!(publicKey && privateKey), [publicKey, privateKey]);

  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
            <View style={styles.view}>
              {isReady ? (
                <>
                  <View style={styles.channelsTopView}>
                    <Text style={styles.title}>
                      {intl.formatMessage({
                        id: 'chat.title',
                      })}
                    </Text>
                    <DropdownButton
                      isHasChildIcon
                      iconName="more-vert"
                      options={dropdownOption.map(({ title }) => title)}
                      onSelect={onPressDropdownHandler}
                    />
                  </View>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.input}
                      onChangeText={setSearch}
                      value={search}
                      placeholder={intl.formatMessage({ id: 'chat.search' })}
                      placeholderTextColor="#c1c5c7"
                      autoCapitalize="none"
                      returnKeyType="done"
                    />
                  </View>

                  {/* <ChatChannelsList /> */}
                </>
              ) : (
                <ChatWelcome />
              )}
            </View>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </>
  );
};

export default injectIntl(ChannelsScreen);
