import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import { Operation } from '@hiveio/dhive';
import {
  ActionModal,
  PostTranslationModal,
  QuickProfileModal,
  QuickPostModal,
  CrossPostModal,
  AccountsBottomSheet,
  QRModal,
  ChatOptionsSheet,
  ChatChannelOptionsSheet,
  PostingAuthoritySheet,
  HiveAuthBroadcastSheet,
} from '../components';
import { TippingDialog } from '../components/tipping';
import { TTSSettingsSheet } from '../components/textToSpeech/ttsSettingsSheet';
import { ActionModalPayload } from '../components/actionModal/container/actionModalContainer';

export enum SheetNames {
  POST_TRANSLATION = 'post_translation',
  QUICK_PROFILE = 'quick_profile',
  ACTION_MODAL = 'action_modal',
  QUICK_POST = 'quick_post',
  CROSS_POST = 'cross_post',
  ACCOUNTS_SHEET = 'accounts_sheet',
  QR_SCAN = 'qr_sheet',
  CHAT_OPTIONS = 'chat_options',
  CHAT_CHANNEL_OPTIONS = 'chat_channel_options',
  TIPPING_DIALOG = 'tipping_dialog',
  TTS_SETTINGS = 'tts_settings',
  POSTING_AUTHORITY_PROMPT = 'posting_authority_prompt',
  HIVE_AUTH_BROADCAST = 'hive_auth_broadcast',
}

registerSheet(SheetNames.POST_TRANSLATION, PostTranslationModal);
registerSheet(SheetNames.QUICK_PROFILE, QuickProfileModal);
registerSheet(SheetNames.ACTION_MODAL, ActionModal);
registerSheet(SheetNames.QUICK_POST, QuickPostModal);
registerSheet(SheetNames.CROSS_POST, CrossPostModal);
registerSheet(SheetNames.ACCOUNTS_SHEET, AccountsBottomSheet);
registerSheet(SheetNames.QR_SCAN, QRModal);
registerSheet(SheetNames.CHAT_OPTIONS, ChatOptionsSheet);
registerSheet(SheetNames.CHAT_CHANNEL_OPTIONS, ChatChannelOptionsSheet);
registerSheet(SheetNames.TIPPING_DIALOG, TippingDialog);
registerSheet(SheetNames.TTS_SETTINGS, TTSSettingsSheet);
registerSheet(SheetNames.POSTING_AUTHORITY_PROMPT, PostingAuthoritySheet);
registerSheet(SheetNames.HIVE_AUTH_BROADCAST, HiveAuthBroadcastSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    [SheetNames.POST_TRANSLATION]: SheetDefinition<{
      payload: {
        content: any;
      };
    }>;
    [SheetNames.QUICK_PROFILE]: SheetDefinition<{
      payload: {
        username: string;
      };
    }>;
    [SheetNames.QUICK_POST]: SheetDefinition<{
      payload: {
        mode: 'comment' | 'wave';
        parentPost?: any;
      };
    }>;
    [SheetNames.CROSS_POST]: SheetDefinition<{
      payload: {
        postContent: any;
      };
    }>;
    [SheetNames.ACTION_MODAL]: SheetDefinition<{
      payload: ActionModalPayload;
    }>;
    [SheetNames.ACCOUNTS_SHEET]: SheetDefinition;
    [SheetNames.QR_SCAN]: SheetDefinition;
    [SheetNames.CHAT_OPTIONS]: SheetDefinition<{
      payload: {
        post: any;
        channelId: string;
        onReply?: () => void;
        onReaction?: (emojiName: string) => void;
        onEdit?: () => void;
        onRemove?: () => void;
        onTranslate?: () => void;
        onPin?: () => void;
        onUnpin?: () => void;
        currentUserId?: string;
        isOwnMessage?: boolean;
        canModerate?: boolean;
      };
    }>;
    [SheetNames.CHAT_CHANNEL_OPTIONS]: SheetDefinition<{
      payload: {
        title?: string;
        hasUnread?: boolean;
        isFavorite?: boolean;
        isMuted?: boolean;
        isDM?: boolean;
        onMarkRead?: () => void;
        onToggleFavorite?: () => void;
        onToggleMute?: () => void;
        onLeave?: () => void;
      };
    }>;
    [SheetNames.TIPPING_DIALOG]: SheetDefinition<{
      payload: {
        post: any;
        onSuccess?: (data: any) => void;
      };
    }>;
    [SheetNames.TTS_SETTINGS]: SheetDefinition<{
      payload?: {
        onSettingsChanged?: () => void;
      };
    }>;
    [SheetNames.POSTING_AUTHORITY_PROMPT]: SheetDefinition;
    [SheetNames.HIVE_AUTH_BROADCAST]: SheetDefinition<{
      payload: {
        operations: Operation[];
        onSuccess?: (result: any) => void;
        onError?: (error: Error) => void;
        onClose?: (error: Error) => void;
      };
    }>;
  }
}

export {};
