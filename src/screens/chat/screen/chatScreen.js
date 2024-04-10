import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { injectIntl } from 'react-intl';
import { LoggedInContainer } from '../../../containers';
import { DropdownButton, Header, Notification, TabBar } from '../../../components';

import styles from './chatScreen.style';
import globalStyles from '../../../globalStyles';

const ChatScreen = ({ intl }) => {
  return (
    <>
      <Header />
      <SafeAreaView style={styles.container}>
        <LoggedInContainer>
          {() => (
            <View style={styles.view}>
              <View style={styles.channelsTopView}>
                <Text>Chat</Text>
                <DropdownButton isHasChildIcon iconName="more-vert" options={['']} />
              </View>
            </View>
          )}
        </LoggedInContainer>
      </SafeAreaView>
    </>
  );
};

export default injectIntl(ChatScreen);
