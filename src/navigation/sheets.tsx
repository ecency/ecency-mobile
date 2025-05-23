import { registerSheet, SheetDefinition } from 'react-native-actions-sheet';
import { ActionModal, PostTranslationModal } from '../components';

registerSheet('action_modal', ActionModal);
registerSheet('post_translation', PostTranslationModal);

// We extend some of the types here to give us great intellisense
// across the app for all registered sheets.
declare module 'react-native-actions-sheet' {
  interface Sheets {
    'post_translation': SheetDefinition<{
      payload: {
        content: any;
      };
    }>
  }
}

export { };