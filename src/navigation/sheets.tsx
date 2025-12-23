import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import {
  ActionModal,
  PostTranslationModal,
  QuickProfileModal,
  QuickPostModal,
  CrossPostModal,
  AccountsBottomSheet,
  QRModal,
  ChatOptionsSheet,
} from '../components';
import { TippingDialog } from '../components/tipping';
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
  TIPPING_DIALOG = 'tipping_dialog',
}

registerSheet(SheetNames.POST_TRANSLATION, PostTranslationModal);
registerSheet(SheetNames.QUICK_PROFILE, QuickProfileModal);
registerSheet(SheetNames.ACTION_MODAL, ActionModal);
registerSheet(SheetNames.QUICK_POST, QuickPostModal);
registerSheet(SheetNames.CROSS_POST, CrossPostModal);
registerSheet(SheetNames.ACCOUNTS_SHEET, AccountsBottomSheet);
registerSheet(SheetNames.QR_SCAN, QRModal);
registerSheet(SheetNames.CHAT_OPTIONS, ChatOptionsSheet);
registerSheet(SheetNames.TIPPING_DIALOG, TippingDialog);

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
        currentUserId?: string;
        isOwnMessage?: boolean;
        canModerate?: boolean;
      };
    }>;
    [SheetNames.TIPPING_DIALOG]: SheetDefinition<{
      payload: {
        post: any;
        onSuccess?: (data: any) => void;
      };
    }>;
  }
}

export {};
