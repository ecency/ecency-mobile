import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import {
  ActionModal,
  PostTranslationModal,
  QuickProfileModal,
  QuickPostModal,
  CrossPostModal,
  AccountsBottomSheet,
} from '../components';

export enum SheetNames {
  POST_TRANSLATION = 'post_translation',
  QUICK_PROFILE = 'quick_profile',
  ACTION_MODAL = 'action_modal',
  QUICK_POST = 'quick_post',
  CROSS_POST = 'cross_post',
  ACCOUNTS_SHEET = 'accounts_sheet',
}

registerSheet(SheetNames.POST_TRANSLATION, PostTranslationModal);
registerSheet(SheetNames.QUICK_PROFILE, QuickProfileModal);
registerSheet(SheetNames.ACTION_MODAL, ActionModal);
registerSheet(SheetNames.QUICK_POST, QuickPostModal);
registerSheet(SheetNames.CROSS_POST, CrossPostModal);
registerSheet(SheetNames.ACCOUNTS_SHEET, AccountsBottomSheet);


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
    [SheetNames.ACCOUNTS_SHEET]: SheetDefinition;
    [SheetNames.ACTION_MODAL]: SheetDefinition<{
      payload: {
        title: string;
        body: string;
        action?: {
          label: string;
          onPress: () => void;
        };
        buttons?: {
          text: string;
          onPress?: () => void;
          style?: 'default' | 'cancel' | 'destructive';
        }[];
        headerImage?: string;
        headerContent?: React.ReactNode;
        bodyContent?: React.ReactNode;
      };
    }>;
  }
}

export {};
