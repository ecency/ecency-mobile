import React, { useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from '@react-navigation/native';
import { CommentsModal, Icon, UserAvatar } from '../..';
import styles from '../styles/botCommentsPreview.styles';
import ROUTES from '../../../constants/routeNames';

interface BotCommentsProps {
  comments: any[];
}

export const BotCommentsPreview = ({ comments }: BotCommentsProps) => {
  const navigation = useNavigation();

  const commentsModalRef = useRef<typeof CommentsModal>();

  if (!comments?.length) {
    return null;
  }

  const _onPress = () => {
    navigation.navigate({
      name: ROUTES.MODALS.BOT_COMMENTS,
      params: {
        comments,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelWrapper}>
        <Icon
          iconType="AntDesign"
          name="doubleright"
          size={16}
          color={EStyleSheet.value('$primaryDarkText')}
        />
      </View>
      <TouchableOpacity onPress={_onPress}>
        <View style={styles.botAvatarsWrapper}>
          {comments.map((comment) => {
            return (
              <View key={`${comment.author}-${comment.permlink}`} style={styles.item}>
                <UserAvatar username={comment.author} noAction />
              </View>
            );
          })}
        </View>
      </TouchableOpacity>

      <CommentsModal ref={commentsModalRef} />
    </View>
  );
};
