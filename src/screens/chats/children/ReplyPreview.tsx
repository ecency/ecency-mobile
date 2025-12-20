import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from '../../../components';
import { getHiveUsernameFromMattermostUser } from '../../../providers/chat/mattermost';
import { ChatPost } from '../utils/messageFormatters';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface ChatParentPreview {
  parent_id?: string;
  parent_message?: string;
  parent_username?: string;
}

interface ReplyPreviewProps {
  rootId: string;
  parentPreview: ChatParentPreview | null;
  isOwnMessage: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  rootMessages: Record<string, ChatPost>;
  userLookup: Record<string, any>;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = React.memo(
  ({ rootId, parentPreview, isOwnMessage, showCloseButton, onClose, rootMessages, userLookup }) => {
    const intl = useIntl();

    let preview = parentPreview;

    if (!preview) {
      const rootMessage = rootMessages[rootId];
      if (!rootMessage) {
        return null;
      }

      const rootAuthorId = rootMessage.user_id;
      const rootMappedUser = rootAuthorId && userLookup[rootAuthorId];
      const hiveUsername = getHiveUsernameFromMattermostUser(rootMappedUser);

      preview = {
        parent_id: rootMessage.id,
        parent_message: rootMessage.message || '',
        parent_username: hiveUsername,
      };
    }

    const rootAuthor =
      typeof preview.parent_username === 'string'
        ? preview.parent_username
        : intl.formatMessage({ id: 'chats.anonymous', defaultMessage: 'Unknown user' });
    const rootBody = typeof preview.parent_message === 'string' ? preview.parent_message : '';
    const rootText = rootBody.length > 100 ? `${rootBody.substring(0, 100)}...` : rootBody;

    return (
      <View
        style={[
          styles.replyPreview,
          isOwnMessage ? styles.replyPreviewOwn : styles.replyPreviewOther,
          showCloseButton && styles.replyPreviewWithClose,
        ]}
      >
        <View style={styles.replyPreviewLine} />
        <View style={styles.replyPreviewContent}>
          <Text
            style={[
              styles.replyPreviewAuthor,
              isOwnMessage ? styles.replyPreviewAuthorOwn : styles.replyPreviewAuthorOther,
            ]}
          >
            {rootAuthor}
          </Text>
          <Text
            style={[
              styles.replyPreviewText,
              isOwnMessage ? styles.replyPreviewTextOwn : styles.replyPreviewTextOther,
            ]}
            numberOfLines={2}
          >
            {rootText}
          </Text>
        </View>
        {showCloseButton && onClose && (
          <TouchableOpacity onPress={onClose} style={styles.cancelReplyButton}>
            <Icon
              name="close"
              iconType="MaterialCommunityIcons"
              size={18}
              color={EStyleSheet.value('$primaryDarkText')}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

ReplyPreview.displayName = 'ReplyPreview';
