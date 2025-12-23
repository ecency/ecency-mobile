import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useIntl } from 'react-intl';
import Hyperlink from 'react-native-hyperlink';
import moment from 'moment';
import { UserAvatar, Icon } from '../../../components';
import { getHiveUsernameFromMattermostUser } from '../../../providers/chat/mattermost';
import { ChatPost, setLinkText, renderTextWithBoldMentions } from '../utils/messageFormatters';
import { UnreadMarker } from './UnreadMarker';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface ThreadMessageItemProps {
  post: ChatPost;
  index: number;
  isOwnMessage: boolean;
  bootstrapUserId: string;
  userLookup: Record<string, any>;
  rootMessages: Record<string, ChatPost>;
  firstUnreadIndex: number | null;
  canModerate: boolean;
  onShowActions: (post: ChatPost, isOwn: boolean) => void;
  onShowUserProfile: (username?: string | null) => void;
  formatPostBody: (post: ChatPost, timestamp?: number) => string;
  parseMessageContent: (rawMessage: string, parseMentionUrl?: boolean) => any;
  renderReplyPreview: (
    rootId: string,
    parentPreview: any,
    isOwnMessage: boolean,
  ) => JSX.Element | null;
  renderReactions: (reactions: any[] | undefined, isOwnMessage: boolean) => JSX.Element | null;
  renderLinkPreview: (linkMeta: any) => JSX.Element | null;
  linkifyInstance: any;
  handleLink: (url: string) => void;
}

export const ThreadMessageItem: React.FC<ThreadMessageItemProps> = React.memo(
  ({
    post,
    index,
    isOwnMessage,
    bootstrapUserId: _bootstrapUserId,
    userLookup,
    rootMessages: _rootMessages,
    firstUnreadIndex,
    canModerate: _canModerate,
    onShowActions,
    onShowUserProfile: _onShowUserProfile,
    formatPostBody,
    parseMessageContent,
    renderReplyPreview,
    renderReactions,
    renderLinkPreview,
    linkifyInstance,
    handleLink,
  }) => {
    const intl = useIntl();

    const authorId = post.user_id || post.user?.id;
    const mappedUser = (authorId && userLookup[authorId]) || post.user;
    const hiveUsername = mappedUser?.hiveUsername || getHiveUsernameFromMattermostUser(mappedUser);
    const author =
      hiveUsername ||
      mappedUser?.nickname ||
      mappedUser?.username ||
      mappedUser?.name ||
      authorId ||
      intl.formatMessage({ id: 'chats.anonymous', defaultMessage: 'Unknown user' });

    const timestamp = post.create_at || post.update_at;
    const body = formatPostBody(post, timestamp);
    const { text: messageText, images: messageImages } = parseMessageContent(body);

    const showUnreadMarker = firstUnreadIndex !== null && index === firstUnreadIndex;

    return (
      <View>
        <UnreadMarker show={showUnreadMarker} />
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.messageContainerOwn : styles.messageContainerOther,
          ]}
        >
          {!isOwnMessage && (
            <UserAvatar username={author} style={styles.messageAvatar} disableSize />
          )}
          <TouchableOpacity
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.messageBubbleOwn : styles.messageBubbleOther,
            ]}
            onLongPress={() => onShowActions(post, isOwnMessage)}
            activeOpacity={0.9}
          >
            {post.root_id && renderReplyPreview(post.root_id, post.props as any, isOwnMessage)}
            {!isOwnMessage && <Text style={styles.author}>{author}</Text>}
            {!!messageText && (
              <Hyperlink
                linkStyle={[
                  styles.hyperlink,
                  isOwnMessage ? styles.hyperlinkOwn : styles.hyperlinkOther,
                ]}
                linkText={(url: string) => setLinkText(url)}
                onPress={(url: string) => handleLink(url)}
                linkify={linkifyInstance}
              >
                <Text style={[styles.body, isOwnMessage ? styles.bodyOwn : styles.bodyOther]}>
                  {renderTextWithBoldMentions(
                    messageText,
                    [styles.body, isOwnMessage ? styles.bodyOwn : styles.bodyOther],
                    linkifyInstance,
                  )}
                </Text>
              </Hyperlink>
            )}
            {messageImages.map((url: string) => (
              <Image
                key={url}
                source={{ uri: url }}
                style={[
                  styles.chatImage,
                  isOwnMessage ? styles.chatImageOwn : styles.chatImageOther,
                ]}
                resizeMode="cover"
              />
            ))}
            {post.props?.link_url &&
              renderLinkPreview({
                url: post.props?.link_url,
                title: post.props?.link_title || '',
                summary: post.props?.link_summary || '',
                image: post.props?.link_image || '',
              })}
            <View style={styles.timestampContainer}>
              {timestamp && (
                <Text
                  style={[
                    styles.timestamp,
                    isOwnMessage ? styles.timestampOwn : styles.timestampOther,
                  ]}
                >
                  {!!post.edit_at && post.edit_at > 0 && (
                    <Text>
                      {intl.formatMessage({ id: 'chats.edited', defaultMessage: 'Edited' })}{' '}
                    </Text>
                  )}
                  {moment(timestamp).fromNow()}
                </Text>
              )}
              {isOwnMessage && (
                <TouchableOpacity
                  onPress={() => onShowActions(post, isOwnMessage)}
                  style={styles.messageActions}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon
                    name="dots-horizontal"
                    iconType="MaterialCommunityIcons"
                    size={16}
                    color={styles.actionsIcon.color}
                  />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </View>
        {renderReactions(post.metadata?.reactions || post.props?.reactions, isOwnMessage)}
      </View>
    );
  },
);

ThreadMessageItem.displayName = 'ThreadMessageItem';
