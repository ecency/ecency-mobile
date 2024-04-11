import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import { injectIntl } from 'react-intl';
import { ChatContext, useKeysQuery } from '@ecency/ns-query';
import { DropdownButton, Header, TextInput } from '../../../components';

import styles from '../style/channelsScreen.style';
import { LoggedInContainer } from '../../../containers';
import { setFeedPosts, setInitPosts } from '../../../redux/actions/postsAction';
import { logout } from '../../../redux/actions/uiAction';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import ChatWelcome from '../components/ChatWelcome';
import ChatDropdown from '../components/chatDropdown';
import ChatCredentialInfo from '../components/chatCredentialInfo';
import { ChatChannelsList } from '../components/chatChannelsList';

const ChannelsScreen = ({ intl }) => {
  const currentAccount = useAppSelector((state) => state.account.currentAccount);
  const { publicKey, privateKey } = useKeysQuery();
  const { receiverPubKey, revealPrivateKey, setReceiverPubKey, setRevealPrivateKey } =
    useContext(ChatContext);

  // const { data: directContacts } = useDirectContactsQuery();
  // const { data: channels } = useChannelsQuery();

  // console.log({ directContacts });
  // console.log({ channels });

  const [search, setSearch] = useState('');

  const isReady = useMemo(
    () => !!(publicKey && privateKey && currentAccount),
    [currentAccount, publicKey, privateKey],
  );

  const isShowManageKey = useMemo(() => isReady && revealPrivateKey, [isReady, revealPrivateKey]);

  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
            <View style={styles.view}>
              {isReady && !isShowManageKey && (
                <>
                  <View style={styles.channelsTopView}>
                    <Text style={styles.title}>
                      {intl.formatMessage({
                        id: 'chat.title',
                      })}
                    </Text>
                    <ChatDropdown onManageChatKey={() => setRevealPrivateKey(!revealPrivateKey)} />
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

                  <ChatChannelsList />
                </>
              )}

              {isShowManageKey && <ChatCredentialInfo onClose={() => setRevealPrivateKey(false)} />}

              {!isReady && <ChatWelcome />}
            </View>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </>
  );
};

export default injectIntl(ChannelsScreen);
