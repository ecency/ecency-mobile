import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import type { Operation } from '@ecency/sdk';
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
  EmojiPickerSheet,
  AuthUpgradeSheet,
  AiAssistModal,
  DictationModal,
  ComposeTranslateModal,
  TransferFavoritesSheet,
  ModNotesSheet,
  CommunityManageSheet,
  CommunityRoleEditSheet,
} from '../components';
import type { ModNotesResult } from '../components/modNotesSheet/modNotesSheet';
import type { CommunityManageAction } from '../components/communityManageSheet/communityManageSheet';
import type { CommunityRoleEditResult } from '../components/communityRoleEditSheet/communityRoleEditSheet';
import { ShareIntentSheet } from '../components/shareIntentSheet';
import SignConfirmSheet from '../screens/dappBrowser/components/signConfirmSheet';
import ReceiveQrSheet from '../components/receiveQrSheet/receiveQrSheet';
import BalanceAnalyticsSheet from '../components/balanceAnalyticsSheet/balanceAnalyticsSheet';
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
  EMOJI_PICKER = 'emoji_picker',
  AUTH_UPGRADE = 'auth_upgrade',
  AI_ASSIST = 'ai_assist',
  DICTATION = 'dictation',
  COMPOSE_TRANSLATE = 'compose_translate',
  SHARE_INTENT = 'share_intent',
  SIGN_CONFIRM = 'sign_confirm',
  RECEIVE_QR = 'receive_qr',
  BALANCE_ANALYTICS = 'balance_analytics',
  TRANSFER_FAVORITES = 'transfer_favorites',
  MOD_NOTES = 'mod_notes',
  COMMUNITY_MANAGE = 'community_manage',
  COMMUNITY_ROLE_EDIT = 'community_role_edit',
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
registerSheet(SheetNames.EMOJI_PICKER, EmojiPickerSheet);
registerSheet(SheetNames.AUTH_UPGRADE, AuthUpgradeSheet);
registerSheet(SheetNames.AI_ASSIST, AiAssistModal);
registerSheet(SheetNames.DICTATION, DictationModal);
registerSheet(SheetNames.COMPOSE_TRANSLATE, ComposeTranslateModal);
registerSheet(SheetNames.SHARE_INTENT, ShareIntentSheet);
registerSheet(SheetNames.SIGN_CONFIRM, SignConfirmSheet);
registerSheet(SheetNames.RECEIVE_QR, ReceiveQrSheet);
registerSheet(SheetNames.BALANCE_ANALYTICS, BalanceAnalyticsSheet);
registerSheet(SheetNames.TRANSFER_FAVORITES, TransferFavoritesSheet);
registerSheet(SheetNames.MOD_NOTES, ModNotesSheet);
registerSheet(SheetNames.COMMUNITY_MANAGE, CommunityManageSheet);
registerSheet(SheetNames.COMMUNITY_ROLE_EDIT, CommunityRoleEditSheet);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    [SheetNames.POST_TRANSLATION]: SheetDefinition<{
      payload: {
        content: any;
        // Pre-select the target language (from the inline banner / a chip).
        initialTargetCode?: string;
        initialSource?: string;
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
        files?: any[];
      };
    }>;
    [SheetNames.CROSS_POST]: SheetDefinition<{
      payload: {
        postContent: any;
      };
    }>;
    [SheetNames.ACTION_MODAL]: SheetDefinition<{
      payload: ActionModalPayload;
      returnValue: string | undefined;
    }>;
    [SheetNames.ACCOUNTS_SHEET]: SheetDefinition;
    [SheetNames.QR_SCAN]: SheetDefinition<{
      payload?: {
        onScan?: (value: string) => void;
      };
      returnValue: string | undefined;
    }>;
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
    [SheetNames.POSTING_AUTHORITY_PROMPT]: SheetDefinition<{
      payload?: {
        onGranted?: () => void | Promise<void>;
        onSkipped?: () => void | Promise<void>;
        onError?: (error: Error) => void;
      };
    }>;
    [SheetNames.HIVE_AUTH_BROADCAST]: SheetDefinition<{
      payload: {
        operations: Operation[];
      };
      returnValue: { success: true; result: any } | { success: false; error: Error };
    }>;
    [SheetNames.EMOJI_PICKER]: SheetDefinition<{
      payload: {
        onEmojiSelected: (emojiName: string) => void;
      };
    }>;
    [SheetNames.AUTH_UPGRADE]: SheetDefinition<{
      payload: {
        requiredAuthority: 'posting' | 'active';
        operation: string;
        username: string;
      };
      returnValue: 'key' | 'hivesigner' | 'hiveauth' | false;
    }>;
    [SheetNames.SHARE_INTENT]: SheetDefinition<{
      payload: {
        files: any[];
      };
      returnValue: 'blog' | 'wave' | undefined;
    }>;
    [SheetNames.AI_ASSIST]: SheetDefinition<{
      payload: {
        text: string;
        onApply?: (output: string, action: string) => void;
        supportedActions?: string[];
      };
    }>;
    [SheetNames.DICTATION]: SheetDefinition<{
      payload: {
        onInsert: (text: string) => void;
      };
    }>;
    [SheetNames.COMPOSE_TRANSLATE]: SheetDefinition<{
      payload: {
        body: string;
        title?: string;
        onApply: (appendix: string, titleMarker?: string) => void;
      };
    }>;
    [SheetNames.SIGN_CONFIRM]: SheetDefinition<{
      payload: {
        type: string;
        domain: string;
        username: string;
        method?: string;
        [key: string]: any;
      };
      returnValue: boolean;
    }>;
    [SheetNames.RECEIVE_QR]: SheetDefinition<{
      payload: {
        username: string;
      };
    }>;
    [SheetNames.BALANCE_ANALYTICS]: SheetDefinition<{
      payload: {
        coinType: string;
        username: string;
      };
    }>;
    [SheetNames.TRANSFER_FAVORITES]: SheetDefinition<{
      payload?: {
        limit?: number;
      };
      returnValue: string | undefined;
    }>;
    [SheetNames.MOD_NOTES]: SheetDefinition<{
      payload?: {
        title?: string;
        description?: string;
        placeholder?: string;
        maxLength?: number;
        confirmLabel?: string;
      };
      // `{ notes }` on confirm, `{ cancelled: true }` on explicit cancel.
      // Dismissing by backdrop, swipe or back button resolves the payload
      // object instead, because the library publishes
      // `data || payloadRef.current` on close. Gate on a string `notes`, never
      // on truthiness.
      returnValue: ModNotesResult | undefined;
    }>;
    [SheetNames.COMMUNITY_MANAGE]: SheetDefinition<{
      // `{ action }` on selection. Dismissing by backdrop, swipe or back
      // resolves the payload object instead, because the library publishes
      // `data || payloadRef.current` on close, so match on a known action
      // rather than on truthiness.
      returnValue: { action?: CommunityManageAction } | undefined;
    }>;
    [SheetNames.COMMUNITY_ROLE_EDIT]: SheetDefinition<{
      payload: {
        account: string;
        currentRole: string;
        assignableRoles: string[];
      };
      // `{ role }` on selection, `{ cancelled: true }` on cancel. A backdrop,
      // swipe or back dismissal resolves the payload object instead, because
      // the library publishes `data || payloadRef.current` on close. Gate on a
      // string `role`, never on truthiness.
      returnValue: CommunityRoleEditResult | undefined;
    }>;
  }
}

export {};
