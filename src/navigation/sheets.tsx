import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import { ActionModal, PostTranslationModal, QuickProfileModal } from '../components';


export enum SheetNames {
  POST_TRANSLATION = 'post_translation',
  QUICK_PROFILE = 'quick_profile',
  ACTION_MODAL = 'action_modal',
}

registerSheet(SheetNames.POST_TRANSLATION, PostTranslationModal);
registerSheet(SheetNames.QUICK_PROFILE, QuickProfileModal);
registerSheet(SheetNames.ACTION_MODAL, ActionModal);

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


export { };