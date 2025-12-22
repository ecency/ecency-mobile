import React from 'react';
import { View } from 'react-native';
import ChatsContainer from '../container/chatsContainer';
import { chatsStyles as styles } from '../styles/chats.styles';

const ChatsScreen = () => {
  return (
    <View style={styles.container}>
      <ChatsContainer />
    </View>
  );
};

export default ChatsScreen;
