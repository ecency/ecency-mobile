import React from 'react';
import { View, TextInput, Platform } from 'react-native';
import { useIntl } from 'react-intl';
import EStyleSheet from 'react-native-extended-stylesheet';
import { IconButton } from '../../../components';
import { chatThreadStyles as styles } from '../styles/chatThread.styles';

interface ThreadComposerProps {
  message: string;
  onMessageChange: (text: string) => void;
  onSend: () => void;
  onAttachImage: () => void;
  isSending: boolean;
  isUploadingImage: boolean;
  editingPostId: string | null;
  keyboardHeight: number;
  isKeyboardVisible: boolean;
  renderEditingBanner: () => JSX.Element | null;
  renderComposerReplyPreview: () => JSX.Element | null;
  renderLinkPreview: () => JSX.Element | null;
  renderMentionSuggestions: () => JSX.Element | null;
  inputRef: React.RefObject<TextInput>;
  insets: any;
}

export const ThreadComposer: React.FC<ThreadComposerProps> = React.memo(
  ({
    message,
    onMessageChange,
    onSend,
    onAttachImage,
    isSending,
    isUploadingImage,
    editingPostId: _editingPostId,
    keyboardHeight,
    isKeyboardVisible,
    renderEditingBanner,
    renderComposerReplyPreview,
    renderLinkPreview,
    renderMentionSuggestions,
    inputRef,
    insets,
  }) => {
    const intl = useIntl();

    const composerStyle = {
      ...styles.composer,
      marginBottom: Platform.OS === 'android' && Platform.Version < 35 ? 12 : keyboardHeight + 12,
      paddingBottom: !isKeyboardVisible ? insets.bottom : 0,
    };

    return (
      <View style={styles.composerWrapper}>
        {renderMentionSuggestions()}
        <View style={composerStyle}>
          <View style={styles.inputContainer}>
            <IconButton
              style={[styles.attachButton, isUploadingImage && styles.disabledButton]}
              iconType="MaterialCommunityIcons"
              name="plus"
              color={EStyleSheet.value('$primaryDarkText')}
              size={24}
              onPress={onAttachImage}
              disabled={isUploadingImage || isSending}
              isLoading={isUploadingImage}
            />

            <View style={styles.inputWrapper}>
              {renderEditingBanner()}
              {renderComposerReplyPreview()}
              {renderLinkPreview()}
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder={intl.formatMessage({
                  id: 'chats.message_placeholder',
                  defaultMessage: 'Message',
                })}
                placeholderTextColor="#788187"
                autoCorrect={Platform.OS === 'ios'}
                autoComplete={Platform.OS === 'ios' ? undefined : 'off'}
                spellCheck={Platform.OS === 'ios'}
                value={message}
                onChangeText={onMessageChange}
                multiline
              />
            </View>
          </View>

          <IconButton
            style={[
              styles.sendButton,
              (!message.trim() || isSending || isUploadingImage) && styles.sendButtonDisabled,
            ]}
            iconType="MaterialCommunityIcons"
            name="send"
            color={EStyleSheet.value('$pureWhite')}
            size={20}
            onPress={onSend}
            disabled={!message.trim() || isSending || isUploadingImage}
            isLoading={isSending}
          />
        </View>
      </View>
    );
  },
);

ThreadComposer.displayName = 'ThreadComposer';
